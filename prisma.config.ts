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
    url: env("DATABASE_URL"),
  },
});
