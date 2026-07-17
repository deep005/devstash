# Devstash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.

## Context files

Read the following to get full context of the project

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interactions.md
- @context/current-feature.md

## Critical: non-standard Next.js

This repo pins `next@16.2.10`, which carries breaking changes versus what you likely know. Do NOT rely on training data for Next.js APIs, routing conventions, or config. Before writing or changing any Next.js code, read the relevant guide bundled in `node_modules/next/dist/docs/` (`01-app/` for the App Router, `03-architecture/`, `index.md`) and follow deprecation notices there.

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint (flat config, bare `eslint`)

There is no test setup in this project.

## Architecture

- **App Router** under `src/app/` (React 19 Server Components by default). `layout.tsx` is the root layout; `page.tsx` is the route entry.
- **Import alias**: `@/*` maps to `src/*` (see `tsconfig.json`).
- **Styling**: Tailwind CSS v4, loaded via `@import "tailwindcss"` in `src/app/globals.css` and the `@tailwindcss/postcss` plugin (`postcss.config.mjs`). There is no `tailwind.config.*` — v4 is configured in CSS.
- **Fonts**: Geist / Geist Mono loaded through `next/font/google` in `layout.tsx`, exposed as the `--font-geist-sans` / `--font-geist-mono` CSS variables.

## Neon MCP

All Neon MCP work targets **one project and one branch** unless I explicitly say otherwise:

- **Project**: `devstash` — `blue-brook-23873710`
- **Branch**: `dev-1` — `br-mute-mode-atl0l6az`

Always pass both `projectId` and `branchId` explicitly on every Neon MCP call.
Never rely on the default branch: the project's default is `production`, so an
omitted `branchId` silently hits production.

### All branches in this project

| Branch        | ID                            | Use                                            |
| ------------- | ----------------------------- | ---------------------------------------------- |
| `dev-1`       | `br-mute-mode-atl0l6az`       | **Default target.** Forked from `development`. |
| `development` | `br-sweet-block-atmr1naa`     | Only if I name it. Parent of `dev-1`.          |
| `production`  | `br-withered-poetry-at91imcn` | **Off-limits** — see below. Project default.   |

### Production is off-limits

- **Never** run any Neon MCP tool against the `production` branch
  (`br-withered-poetry-at91imcn`) — including read-only queries — unless I name
  production in that request. Authorization does not carry over to later requests.
- Never run `delete_branch`, `delete_project`, or `reset_from_parent` on any
  branch without asking first.
- On `dev-1`, read freely. Ask before `INSERT`/`UPDATE`/`DELETE`/`DROP`/
  `TRUNCATE` or any migration tool (`prepare_database_migration`,
  `complete_database_migration`).
- If a request is ambiguous about which branch, ask rather than assume.
