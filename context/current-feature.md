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

- **2026-07-11** — Implemented Dashboard UI Phase 2 (sidebar) per [dashboard-phase-2-spec.md](features/dashboard-phase-2-spec.md), driven by `src/lib/mock-data.ts` (imported directly; no DB yet). Added a client sidebar state layer — `src/components/layout/sidebar-context.tsx` (`SidebarProvider`/`useSidebar`) plus `src/hooks/use-is-mobile.ts` — so one toggle collapses the desktop rail and opens the mobile drawer. `src/components/layout/sidebar-content.tsx` renders the shared nav: collapsible **Types** section with per-type Lucide icon + color + count linking to `/items/<type>s` (e.g. `/items/snippets`), and a collapsible **Collections** section split into **Favorites** (starred) and **Recent** (non-favorites by `updatedAt`), plus a user avatar/email footer with a settings link. `src/lib/item-type-icons.ts` maps type icon names to Lucide components. `src/components/layout/app-sidebar.tsx` now wraps that content as an in-flow desktop rail (width-collapse) and an off-canvas mobile drawer with a scrim; `src/components/layout/top-bar.tsx` gained a `PanelLeft` toggle button; layout composition moved into `src/components/layout/dashboard-shell.tsx` so `src/app/dashboard/layout.tsx` stays a server component and the page keeps server rendering. Verified with `npm run lint`, `npm run build`, and a runtime smoke test (GET /dashboard → 200; types, favorites/recent collections, user area, and `/items/*` links present). Main content area is deferred to Phase 3.
- **2026-07-11** — Implemented Dashboard UI Phase 1 on branch `feature/dashboard-phase-1`. Initialized shadcn/ui (radix-nova preset, Lucide/Geist) via CLI — added `components.json`, `src/lib/utils.ts`, `src/components/ui/{button,input}.tsx`, dark/light CSS tokens in `globals.css`, and deps (radix-ui, class-variance-authority, clsx, tailwind-merge, tw-animate-css, lucide-react, shadcn). Set dark mode as default on `<html>` in the root layout. Added the `/dashboard` route with a shell layout (`src/app/dashboard/layout.tsx`) composing a display-only top bar (`src/components/layout/top-bar.tsx` — search field + New Item button) and a sidebar placeholder (`src/components/layout/app-sidebar.tsx`, `h2` "Sidebar"); the page (`src/app/dashboard/page.tsx`) renders the "Main" placeholder. Verified with `npm run lint`, `npm run build`, and a runtime smoke test (GET /dashboard → 200, dark shell renders). Collections/items content is deferred to Phase 2/3.
- **2026-07-11** — Started Dashboard UI Phase 1: ShadCN setup, `/dashboard` route, main layout, dark mode by default, display-only top bar (search + new item button), and sidebar/main placeholders. Status set to In Progress.

- **2026-07-10** — Initial Next.js setup: scaffolded the project with Create Next App (Next.js 16, App Router, React 19, TypeScript, Tailwind CSS v4). Removed the default starter assets (`public/*.svg`), added context docs (`project-overview.md`, `coding-standards.md`, `ai-interaction.md`), and updated `layout.tsx`, `page.tsx`, and `globals.css`.
