# Item CRUD Architecture (Design)

**Status: proposed.** No `/items/[type]` route, item mutation actions, or
item create/edit UI exist in the codebase yet — this document designs the
unified structure for all 7 item types, grounded in the conventions the rest
of the app already follows (auth actions, dashboard `lib/db` reads, the
existing type-agnostic `ItemRow`).

> Sources read for this doc: `context/project-overview.md`,
> `prisma/schema.prisma`, `src/actions/auth.ts`, `src/lib/db/{items,collections,profile}.ts`,
> `src/lib/auth-schemas.ts`, `src/components/items/item-row.tsx`,
> `src/components/layout/{sidebar-content,top-bar}.tsx`, `context/coding-standards.md`.
>
> Two source paths named in the research prompt don't exist and were
> substituted: `docs/content-types.md` → **`docs/item-types.md`** (written by
> a prior `/research` pass, documents the 7 types/colors/icons in full);
> `src/lib/constants.tsx` → **`src/lib/item-type-icons.ts`** (the icon-name →
> Lucide component map, same substitution noted in that doc).

## Why one dynamic route + shared components

All 7 item types share the same shape at the data layer: an `Item` row with
a `contentType` (`TEXT | FILE | URL`), an `itemType` relation that supplies
display metadata (name, icon, color), and the same cross-cutting fields
(favorite, pinned, tags, collections — see `docs/item-types.md`'s "Shared
properties" section). The existing dashboard code already proved this works:
`ItemRow` (`src/components/items/item-row.tsx`) renders all 7 types with zero
type branching — it just reads `item.itemType.icon`/`.color`. The CRUD layer
should follow the same principle: **one route, one action file, one query
module — type differences are isolated to the smallest possible surface**
(a handful of field components), not threaded through routing or mutations.

## File structure

```
src/
├── actions/
│   └── items.ts                    # NEW — all item mutations, one file
├── lib/
│   ├── db/
│   │   └── items.ts                # EXTEND — existing file, add type-scoped reads
│   └── item-schemas.ts             # NEW — Zod schemas for item create/update
├── app/
│   └── items/
│       └── [type]/
│           └── page.tsx            # NEW — the one dynamic route
└── components/
    └── items/
        ├── item-row.tsx            # EXISTING — reused as-is, no changes needed
        ├── item-list.tsx           # NEW — empty state + maps ItemSummary[] → ItemRow
        ├── item-form-drawer.tsx    # NEW — create/edit, client component
        └── fields/
            ├── text-content-field.tsx   # NEW — content textarea (+ language for snippet)
            ├── file-upload-field.tsx    # NEW — R2 upload widget (file, image)
            └── url-field.tsx            # NEW — url input (link)
```

This mirrors the file-organization rules in `context/coding-standards.md`
exactly: **"Server Actions: `src/actions/[feature].ts`"** (one file per
feature, not one per item type) and **"Lib/Utils: `src/lib/[utility].ts`"**.
It also matches the shape every existing feature already uses — compare
`src/actions/auth.ts` (one file, many related mutations) and
`src/lib/db/profile.ts` (one query module per domain).

No new `src/types/` file is needed — every existing `lib/db/*.ts` module
colocates its exported interfaces next to the queries that produce them
(`ItemSummary` in `items.ts`, `CollectionSummary` in `collections.ts`,
`ProfileData` in `profile.ts`); item CRUD should keep that pattern rather
than centralizing types separately.

## How `/items/[type]` routing works

`[type]` is the **plural slug** already established by the sidebar's link
builder (`src/components/layout/sidebar-content.tsx`):

```ts
// existing, unchanged
function typeHref(name: string): string {
  return `/items/${name}s`; // "snippet" → "/items/snippets"
}
```

All 7 system type names pluralize with a plain `s` (snippets, prompts,
commands, notes, files, images, links), so no irregular-plural map is
needed — the route handler just strips the trailing `s` to recover the
type name, or (safer, and what's recommended) resolves against a small
explicit `SLUG_TO_TYPE` map so an invalid slug 404s instead of silently
looking up a garbage type name:

```ts
// src/app/items/[type]/page.tsx (sketch)
const SLUG_TO_TYPE: Record<string, string> = {
  snippets: "snippet", prompts: "prompt", commands: "command",
  notes: "note", files: "file", images: "image", links: "link",
};

export default async function ItemTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type: slug } = await params;
  const typeName = SLUG_TO_TYPE[slug];
  if (!typeName) notFound();

  const items = await getItemsByType(typeName); // new lib/db/items.ts export
  // ...
}
```

Responsibilities of this one route:

1. **Resolve the slug** to a canonical type name (404 on unknown slugs).
2. **Fetch** that type's items via a new `getItemsByType(name)` in
   `src/lib/db/items.ts`, following the existing `ITEM_SUMMARY_SELECT` +
   `toItemSummary` pattern already used by `getPinnedItems`/`getRecentItems`
   — same `ItemSummary` shape, just filtered by `itemType.name` instead of
   `isPinned`.
3. **Render** the shared list — reusing `ItemRow` unchanged, wrapped in a new
   `ItemList` for the empty state ("No snippets yet").
4. **Pro-gate** `file`/`image`: the sidebar already flags these with a `PRO`
   badge (`PRO_TYPE_NAMES` in `sidebar-content.tsx`) but doesn't block
   access. Per `CLAUDE.md`'s note that Pro gating is enabled "before launch,"
   this page is the natural enforcement point once that ships — check
   `session.user.isPro` before rendering the create action for these two
   types.

This is the *only* dynamic segment in the items area — there is no nested
`/items/[type]/[id]` route. Viewing/editing a single item happens through
the drawer (below), not a page navigation, which is what keeps "one dynamic
route" literally true and matches `context/project-overview.md`'s UI
guideline: **"Drawer Animations - Slide-in for item editing"** (also
depicted in the referenced `dashboard-ui-drawer.png` screenshot). A likely
implementation reads an `?item=<id>` search param on the same page to open
the drawer in edit mode, rather than a route change — but no shadcn `sheet`
primitive is installed yet (only `dialog`/`alert-dialog`, both centered
modals used for profile's change-password/delete-account flows); adding one
is a prerequisite, since neither existing dialog primitive slides in from an
edge.

The already-scaffolded **"New Item"** button in `src/components/layout/top-bar.tsx`
is currently display-only ("wiring comes in a later phase," per its own
comment) — it's the other entry point into the same drawer, opened with no
`item` param (create mode) and, when triggered from within a type page, a
pre-selected `contentType`/type default.

## Where type-specific logic lives (components, not actions)

The mutation layer is **intentionally type-blind**. `src/actions/items.ts`
takes an `itemTypeId` + whatever `contentType`-appropriate fields the form
sent, validates with Zod, and writes the row — it has no `switch (typeName)`
anywhere. Type-specific behavior is pushed up into two places:

1. **Field components** (`src/components/items/fields/`) — the create/edit
   drawer picks which field group to render based on the selected type's
   `contentType`, not its name:
   - `TEXT` (`contentType`) → `TextContentField` (a `content` textarea; adds
     a `language` select only when the type is specifically `snippet`, since
     `language` is meaningless for prompt/command/note — see
     `docs/item-types.md`'s field table).
   - `FILE` → `FileUploadField` (R2 upload; produces `fileUrl`/`fileName`/`fileSize`).
   - `URL` → `UrlField` (a `url` input).

   This keeps the *branch point* at exactly 3 cases (matching the 3
   `ContentType` enum values) instead of 7, since 4 of the 7 types
   (snippet/prompt/command/note) share one field group.

2. **Zod schemas** (`src/lib/item-schemas.ts`) — a discriminated union keyed
   on `contentType`, mirroring the enum, e.g.:

   ```ts
   const textItemSchema = z.object({
     contentType: z.literal("TEXT"),
     content: z.string().min(1),
     language: z.string().optional(),
     // + shared fields (title, description, itemTypeId, ...)
   });
   const fileItemSchema = z.object({
     contentType: z.literal("FILE"),
     fileUrl: z.string(), fileName: z.string(), fileSize: z.number(),
     // + shared fields
   });
   const urlItemSchema = z.object({
     contentType: z.literal("URL"),
     url: z.url(),
     // + shared fields
   });
   export const itemSchema = z.discriminatedUnion("contentType", [
     textItemSchema, fileItemSchema, urlItemSchema,
   ]);
   ```

   This is the same "Zod schema per feature" convention as
   `src/lib/auth-schemas.ts`, just discriminated instead of flat, because
   (unlike auth forms) the valid field set genuinely varies by submission.

`ItemRow` needs **no changes** — it was already built type-agnostically
(icon/color sourced from `item.itemType`, confirmed in `docs/item-types.md`)
and is reused as-is by the new list page.

## Component responsibilities

| Component | Type | Responsibility | Type-specific? |
|---|---|---|---|
| `app/items/[type]/page.tsx` | Server | Resolve slug → type name (404 on miss), fetch via `getItemsByType`, Pro-gate file/image, render `ItemList` | Only for routing/gating, not display |
| `components/items/item-list.tsx` | Server | Map `ItemSummary[]` → `ItemRow`s; empty state copy | No |
| `components/items/item-row.tsx` (existing) | Server | Icon chip, title, pin/favorite badges, date, description, tags | No — reads `itemType.{icon,color}` generically |
| `components/items/item-form-drawer.tsx` | Client (`useActionState`) | Slide-in panel; shared fields (title, description, tags, collections); delegates content fields to the matching `fields/*` component; calls `createItem`/`updateItem` | Delegates only |
| `components/items/fields/text-content-field.tsx` | Client | `content` textarea + conditional `language` select | Yes (TEXT) |
| `components/items/fields/file-upload-field.tsx` | Client | R2 upload UI, progress, produces file metadata | Yes (FILE) |
| `components/items/fields/url-field.tsx` | Client | `url` input with basic format hint | Yes (URL) |
| `actions/items.ts` | Server (`"use server"`) | `createItem`/`updateItem` (form-state shaped, like `signInWithCredentials` — returns `{error, fieldErrors}` for inline errors), `deleteItem`/`toggleFavorite`/`togglePin` (simple `{success, data, error}` per `coding-standards.md`, triggered directly from icon buttons + a toast, no form state) | No |
| `lib/db/items.ts` (extended) | Server-only module | `getItemsByType(name)` (new), plus existing `getPinnedItems`/`getRecentItems`/`getItemTypesWithCounts` | Filters by type; doesn't branch behavior by it |
| `lib/item-schemas.ts` | Shared (Zod) | Discriminated-union validation by `contentType` | Yes, by `contentType` only (3 branches, not 7) |

## Two mutation shapes, matching two existing patterns in the codebase

The codebase already has both action shapes in production, so item CRUD
should split along the same line rather than inventing a third:

- **Form-driven mutations** (`createItem`, `updateItem`) — need per-field
  validation errors shown inline in the drawer. Follow `signInWithCredentials`
  /`changePassword`'s shape: `(prevState, formData) => State` for
  `useActionState`, `{ error, fieldErrors? }`.
- **One-shot mutations** (`deleteItem`, `toggleFavorite`, `togglePin`,
  collection add/remove) — no form, triggered by a single icon-button click
  (star, pin, trash). Follow `context/coding-standards.md`'s documented
  default directly: `{ success, data, error }`, called imperatively, result
  surfaced via `sonner` (already wired app-wide since the rate-limiting
  feature) rather than inline field state. Per the standing icon-button
  convention (favorite = filled star, pin = `Pin` icon, delete = `Trash2`),
  these pair naturally with icon-only affordances on `ItemRow` itself.

## Open gaps this design surfaces (not yet decided)

- No `sheet`/drawer shadcn primitive is installed — needed before
  `item-form-drawer.tsx` can be built to spec (slide-in, not centered).
- File/image upload has no R2 client wiring anywhere in `src/lib/` yet
  (`r2.ts` from the suggested project structure in `project-overview.md`
  doesn't exist) — `FileUploadField` has a hard dependency on that landing
  first.
- Pro-gating is UI-only today (`PRO_TYPE_NAMES` badge); real enforcement
  (blocking file/image creation for free users) is deferred per `CLAUDE.md`'s
  "Development Note" and has no `isPro` check anywhere in current code.
