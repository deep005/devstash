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
