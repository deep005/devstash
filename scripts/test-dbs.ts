import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

// Database health check. Verifies, against DATABASE_URL, that we can connect,
// that the migration history is fully applied, and that the 7 system item
// types have been seeded. Written so a second branch (e.g. production) can be
// added by passing another connection string to `testDatabase`.
//
// Run with: npm run db:test  (or: npx tsx scripts/test-dbs.ts)

const EXPECTED_SYSTEM_TYPES = [
  "command",
  "file",
  "image",
  "link",
  "note",
  "prompt",
  "snippet",
] as const;

type MigrationRow = { migration_name: string; finished_at: Date | null };

async function testDatabase(label: string, url: string | undefined): Promise<void> {
  console.log(`\nTesting ${label}…`);

  if (!url) {
    throw new Error("DATABASE_URL is not set — add it to your .env file.");
  }

  const adapter = new PrismaPg({ connectionString: url });
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Connectivity
    await prisma.$queryRaw`SELECT 1`;
    console.log("  ✓ connected");

    // 2. Migration history is applied and finished
    const migrations = await prisma.$queryRaw<MigrationRow[]>`
      SELECT migration_name, finished_at
      FROM _prisma_migrations
      ORDER BY started_at ASC
    `;
    if (migrations.length === 0) {
      throw new Error("no migrations applied — run `npm run db:migrate`");
    }
    const unfinished = migrations.filter((m) => m.finished_at === null);
    if (unfinished.length > 0) {
      const names = unfinished.map((m) => m.migration_name).join(", ");
      throw new Error(`unfinished migration(s): ${names}`);
    }
    console.log(`  ✓ ${migrations.length} migration(s) applied`);
    for (const m of migrations) console.log(`      - ${m.migration_name}`);

    // 3. System item types are seeded
    const systemTypes = await prisma.itemType.findMany({
      where: { isSystem: true, userId: null },
      select: { name: true },
    });
    const seeded = new Set(systemTypes.map((t) => t.name));
    const missing = EXPECTED_SYSTEM_TYPES.filter((name) => !seeded.has(name));
    if (missing.length > 0) {
      throw new Error(
        `missing system item types (${missing.join(", ")}) — run \`npm run db:seed\``,
      );
    }
    console.log(`  ✓ ${EXPECTED_SYSTEM_TYPES.length} system item types seeded`);

    // 4. Record counts (informational)
    const [users, items, collections] = await Promise.all([
      prisma.user.count(),
      prisma.item.count(),
      prisma.collection.count(),
    ]);
    console.log(
      `  · users: ${users}, items: ${items}, collections: ${collections}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function main(): Promise<void> {
  await testDatabase("DATABASE_URL", process.env.DATABASE_URL);
  console.log("\nDatabase is healthy ✅");
}

main().catch((error: unknown) => {
  console.error("\nDatabase test failed ❌");
  console.error(`  ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
