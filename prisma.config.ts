import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 configuration. The CLI reads schema, migrations and datasource
// settings from here (seeding is configured here now, not in package.json).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // The CLI (migrate/db/studio) needs Neon's DIRECT endpoint — Prisma
    // Migrate's advisory lock does not survive the PgBouncer pooler. The
    // runtime client keeps using the pooled DATABASE_URL via the pg adapter.
    url: env("DIRECT_URL"),
  },
});
