# Item Types

DevStash has 7 **system item types**. They are seeded rows in the `item_types`
table (`isSystem: true`, `userId: null`) — not a hardcoded enum — but the app
treats the set as fixed/immutable in the UI (no "create custom type" flow
exists yet, despite `ItemType.userId` supporting user-owned types at the
schema level for that future feature).

> Sources read for this doc: `prisma/schema.prisma`, `prisma/seed.ts`,
> `src/lib/item-type-icons.ts`, `src/lib/db/items.ts`,
> `src/components/items/item-row.tsx`, `src/components/layout/sidebar-content.tsx`,
> `context/project-overview.md`.
>
> Note: the research prompt pointed at `src/lib/constants.tsx`, which does not
> exist in this codebase. The equivalent — the icon-name → Lucide component
> map — lives at `src/lib/item-type-icons.ts`.

## The 7 types

| # | Type      | Icon (Lucide) | Color                | Content Type | Route (planned)   | Pro-only |
|---|-----------|----------------|-----------------------|--------------|--------------------|----------|
| 1 | `snippet` | `Code`         | `#3b82f6` (blue)      | `TEXT`       | `/items/snippets`  | No |
| 2 | `prompt`  | `Sparkles`     | `#8b5cf6` (purple)    | `TEXT`       | `/items/prompts`   | No |
| 3 | `command` | `Terminal`     | `#f97316` (orange)    | `TEXT`       | `/items/commands`  | No |
| 4 | `note`    | `StickyNote`   | `#fde047` (yellow)    | `TEXT`       | `/items/notes`     | No |
| 5 | `file`    | `File`         | `#6b7280` (gray)      | `FILE`       | `/items/files`     | **Yes** |
| 6 | `image`   | `Image`        | `#ec4899` (pink)      | `FILE`       | `/items/images`    | **Yes** |
| 7 | `link`    | `Link`         | `#10b981` (emerald)   | `URL`        | `/items/links`     | No |

Type rows are seeded verbatim in `prisma/seed.ts`:

```ts
const systemItemTypes = [
  { name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { name: "command", icon: "Terminal", color: "#f97316", isSystem: true },
  { name: "note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "file", icon: "File", color: "#6b7280", isSystem: true },
  { name: "image", icon: "Image", color: "#ec4899", isSystem: true },
  { name: "link", icon: "Link", color: "#10b981", isSystem: true },
];
```

Seeding is idempotent via find-then-create (`findFirst` on
`{ name, userId: null }` then `create`), not `upsert` — Postgres treats
`NULL` as distinct per row, so the schema's `@@unique([name, userId])`
constraint doesn't cover `userId: null` rows, and Prisma's generated
`name_userId` upsert input types `userId` as non-nullable, making `upsert`
unusable for system types.

The icon strings map to components via `src/lib/item-type-icons.ts`:

```ts
export const ITEM_TYPE_ICONS: Record<string, LucideIcon> = {
  Code, Sparkles, Terminal, StickyNote, File, Image, Link,
};

export function getItemTypeIcon(icon: string): LucideIcon {
  return ITEM_TYPE_ICONS[icon] ?? File;
}
```

Unknown/missing icon names fall back to `File` rather than throwing.

## Purpose per type

| Type | Purpose |
|------|---------|
| **Snippet** | Reusable code (functions, components, config blocks), optionally tagged with a `language` for syntax highlighting. |
| **Prompt** | Saved AI prompts/instructions (system prompts, reusable task templates). |
| **Command** | Shell/CLI one-liners or short scripts (git, docker, npm, deploy commands). |
| **Note** | Freeform text notes not tied to code or a URL. |
| **File** | An uploaded file (Pro-only; content lives in Cloudflare R2, not the DB). |
| **Image** | An uploaded image (Pro-only; same storage model as File). |
| **Link** | A bookmarked URL with a title/description. |

## Key fields used per `ContentType`

`Item.contentType` (`TEXT | FILE | URL`) determines which of the type-specific
columns on `Item` are populated. This is a convention enforced by application
code (seed script, future create/edit forms) — the schema does not use a
discriminated union or DB constraint to enforce it; all type-specific columns
are nullable on every row regardless of `contentType`.

| `ContentType` | Item types | Fields populated | Fields left null |
|----------------|------------|-------------------|-------------------|
| `TEXT`  | snippet, prompt, command, note | `content` (+ `language` for snippets) | `fileUrl`, `fileName`, `fileSize`, `url` |
| `FILE`  | file, image                    | `fileUrl`, `fileName`, `fileSize`      | `content`, `language`, `url` |
| `URL`   | link                           | `url`                                   | `content`, `language`, `fileUrl`, `fileName`, `fileSize` |

Fields shared by **every** item regardless of type: `title`, `description`,
`isFavorite`, `isPinned`, `createdAt`, `updatedAt`, `userId`, `itemTypeId`,
`tags` (many-to-many via the implicit `ItemTags` relation), `collections`
(many-to-many via the explicit `ItemCollection` join table).

## Shared properties across types

- Every `Item` belongs to exactly one `ItemType` (`itemTypeId`, required) but
  can belong to **many** `Collection`s (via `ItemCollection`).
- Every type supports the same cross-cutting features: favoriting
  (`isFavorite`), pinning (`isPinned`), tagging (`Tag[]`), and multi-collection
  membership — none of this is type-specific.
- Display metadata (icon, color) lives on the `ItemType` row, not hardcoded
  per content — so an item's row/card accent color and icon are always
  derived from `item.itemType.{icon,color}`, e.g. in
  `src/components/items/item-row.tsx`:

  ```ts
  const iconComponent = getItemTypeIcon(item.itemType.icon);
  const accent = item.itemType.color; // used for left border + icon color
  ```

## Display differences

- **List/row rendering is currently type-agnostic.** `ItemRow` (dashboard
  pinned/recent lists) renders the same layout for all 7 types: icon chip
  (type color, 10% opacity background), title, pin/favorite badges, updated
  date, optional description, optional tag chips. There is no `FILE`/`URL`/
  `TEXT`-specific rendering yet (e.g. no thumbnail preview for images, no
  favicon for links, no syntax-highlighted code preview for snippets).
- **Sidebar "Types" nav** (`src/components/layout/sidebar-content.tsx`) lists
  all 7 types in the canonical order (snippet, prompt, command, note, file,
  image, link — defined in `src/lib/db/items.ts`'s `SYSTEM_TYPE_ORDER`) with
  icon, color, and the signed-in user's per-type item count. `file` and
  `image` additionally render a `PRO` badge:
  ```ts
  const PRO_TYPE_NAMES = new Set(["file", "image"]);
  ```
- **Collection cards** show one icon per distinct item type present in that
  collection, with the accent border color taken from the collection's
  *most-used* item type (count desc, name asc tie-break) — not a fixed
  per-collection type.
- **Per-type list pages don't exist yet.** The routes in the table above
  (`/items/snippets`, `/items/links`, etc.) are what the sidebar links to and
  what `context/project-overview.md` specifies, but no `src/app/items/`
  directory exists in the codebase yet — only `/dashboard` and `/profile` are
  built. Confirmed via `find`/`grep`: no route directory under `src/app`
  matches `items`, and `contentType`/`ContentType.` has zero references
  outside `prisma/schema.prisma`, `prisma/seed.ts`, and the generated Prisma
  client. Type-specific detail rendering (code viewer for snippets, image
  preview, file download, link preview) is therefore still unimplemented.

## Text vs. File vs. URL classification

- **TEXT** (snippet, prompt, command, note) — content stored directly in
  Postgres (`Item.content`), free tier eligible, no external storage
  dependency. `language` is only meaningful for snippets (syntax
  highlighting) but the column isn't restricted to that type at the DB level.
- **FILE** (file, image) — content stored externally in Cloudflare R2;
  `Item.fileUrl`/`fileName`/`fileSize` are pointers/metadata, not the content
  itself. Gated to Pro tier per `context/project-overview.md`'s pricing table
  and enforced today only as a UI badge (`PRO_TYPE_NAMES` in the sidebar) —
  per `CLAUDE.md`'s "Development Note," actual Pro gating (blocking creation
  for free users) is deferred until before launch.
- **URL** (link) — a reference to external content; `Item.url` stores the
  target. No fetched metadata (title/favicon/OG-image) is cached on the item
  today.

## Seeded sample data (dev/demo)

`prisma/seed.ts`'s `seedSampleData()` only ever creates items of type
`snippet`, `prompt`, `command`, and `link` (`SeedItemType` type union) across
5 collections — `note`, `file`, and `image` have no seeded example items, and
seeding is skip-if-exists (keyed on the demo user `demo@devstash.io` already
existing) so it never overwrites in-app edits.
