# Current Feature

## Status

Completed

## Feature

_None in progress._

## Goals

_None in progress._

## Notes

_None._

## History

<!-- History context here latest to earliest -->

- **2026-07-13** — Implemented Dashboard UI Phase 3 (main content area) per [dashboard-phase-3-spec.md](features/dashboard-phase-3-spec.md) on branch `feature/dashboard-phase-3`, driven by `src/lib/mock-data.ts` (imported directly; no DB yet). Added helpers `src/lib/format.ts` (`formatShortDate`, UTC-based) and `src/lib/item-types.ts` (`getItemTypeById`). Built server components: `src/components/dashboard/stats-cards.tsx` (4 tiles — total items, collections, favorite items, favorite collections; not in screenshot — with a distinct per-card colored blur glow + magnify/shadow on hover), `src/components/collections/collection-card.tsx` (type-accent left border, favorite star, item count, description, type-icon row), `src/components/dashboard/collections-section.tsx` (heading + "View all" + responsive grid), `src/components/items/item-row.tsx` (shared row: type icon via `createElement` to satisfy `react-hooks/static-components`, pin/favorite badges, short date, tags), and `src/components/dashboard/item-section.tsx` (reusable titled list). `src/app/dashboard/page.tsx` composes header → stats → collections → Pinned → Recent (10 most recent by `updatedAt`). UX polish: `cursor-pointer` on interactive elements (shared `Button` base, sidebar nav rows/section toggles, cards/rows); fixed the dashboard height so the shell is pinned to the viewport — `h-dvh` on the shell with `flex-1` removed (it set `flex-basis:0%`, overriding the height), plus `min-h-0` and `overflow-hidden` — so only `main` scrolls and the sidebar fits the screen. RSC cleanup to honor "server by default": deleted `dashboard-shell.tsx` (folded into the server `src/app/dashboard/layout.tsx`), made `src/components/layout/top-bar.tsx` a server component, and extracted the interactive toggle into a client island `src/components/layout/sidebar-toggle.tsx`; client components are now limited to `sidebar-context`, `app-sidebar`, `sidebar-content`, and `sidebar-toggle`. Verified with `npm run lint`, `npm run build`, runtime smoke tests (GET /dashboard → 200; stats, collections, pinned, recent items, item dates, and tags present; no provider error), and a headless screenshot confirming the sidebar spans the full viewport height. Completes the 3-phase dashboard UI.
- **2026-07-11** — Implemented Dashboard UI Phase 2 (sidebar) per [dashboard-phase-2-spec.md](features/dashboard-phase-2-spec.md), driven by `src/lib/mock-data.ts` (imported directly; no DB yet). Added a client sidebar state layer — `src/components/layout/sidebar-context.tsx` (`SidebarProvider`/`useSidebar`) plus `src/hooks/use-is-mobile.ts` — so one toggle collapses the desktop rail and opens the mobile drawer. `src/components/layout/sidebar-content.tsx` renders the shared nav: collapsible **Types** section with per-type Lucide icon + color + count linking to `/items/<type>s` (e.g. `/items/snippets`), and a collapsible **Collections** section split into **Favorites** (starred) and **Recent** (non-favorites by `updatedAt`), plus a user avatar/email footer with a settings link. `src/lib/item-type-icons.ts` maps type icon names to Lucide components. `src/components/layout/app-sidebar.tsx` now wraps that content as an in-flow desktop rail (width-collapse) and an off-canvas mobile drawer with a scrim; `src/components/layout/top-bar.tsx` gained a `PanelLeft` toggle button; layout composition moved into `src/components/layout/dashboard-shell.tsx` so `src/app/dashboard/layout.tsx` stays a server component and the page keeps server rendering. Verified with `npm run lint`, `npm run build`, and a runtime smoke test (GET /dashboard → 200; types, favorites/recent collections, user area, and `/items/*` links present). Main content area is deferred to Phase 3.
- **2026-07-11** — Implemented Dashboard UI Phase 1 on branch `feature/dashboard-phase-1`. Initialized shadcn/ui (radix-nova preset, Lucide/Geist) via CLI — added `components.json`, `src/lib/utils.ts`, `src/components/ui/{button,input}.tsx`, dark/light CSS tokens in `globals.css`, and deps (radix-ui, class-variance-authority, clsx, tailwind-merge, tw-animate-css, lucide-react, shadcn). Set dark mode as default on `<html>` in the root layout. Added the `/dashboard` route with a shell layout (`src/app/dashboard/layout.tsx`) composing a display-only top bar (`src/components/layout/top-bar.tsx` — search field + New Item button) and a sidebar placeholder (`src/components/layout/app-sidebar.tsx`, `h2` "Sidebar"); the page (`src/app/dashboard/page.tsx`) renders the "Main" placeholder. Verified with `npm run lint`, `npm run build`, and a runtime smoke test (GET /dashboard → 200, dark shell renders). Collections/items content is deferred to Phase 2/3.
- **2026-07-11** — Started Dashboard UI Phase 1: ShadCN setup, `/dashboard` route, main layout, dark mode by default, display-only top bar (search + new item button), and sidebar/main placeholders. Status set to In Progress.

- **2026-07-10** — Initial Next.js setup: scaffolded the project with Create Next App (Next.js 16, App Router, React 19, TypeScript, Tailwind CSS v4). Removed the default starter assets (`public/*.svg`), added context docs (`project-overview.md`, `coding-standards.md`, `ai-interaction.md`), and updated `layout.tsx`, `page.tsx`, and `globals.css`.
