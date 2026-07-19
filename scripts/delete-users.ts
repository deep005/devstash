import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { DEMO_USER_EMAIL } from "../src/lib/db/demo-user";

// Deletes every user (and, via schema cascade deletes, all of their items,
// collections, custom item types, accounts, and sessions) EXCEPT the seeded
// demo user and their content. Also removes verification tokens for deleted
// accounts and any tags left orphaned (no items) by the deletion. System item
// types (userId = null) and the demo user's data are preserved.
//
// Targets whatever DATABASE_URL points at — double-check the printed host.
//
// Usage:
//   npm run db:delete-users          # dry run: report what WOULD be deleted
//   npm run db:delete-users -- --yes # actually delete
//
// Safety: refuses to run if the demo (keep) user is not found, unless
// --allow-missing-demo is passed (which would delete ALL users).

const KEEP_EMAIL = DEMO_USER_EMAIL;

function hasFlag(name: string): boolean {
  return process.argv.slice(2).includes(name);
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set — add it to your .env file.");
  }

  const apply = hasFlag("--yes") || hasFlag("--confirm");
  const allowMissingKeep = hasFlag("--allow-missing-demo");

  const adapter = new PrismaPg({ connectionString: url });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log(`Database host: ${new URL(url).host}`);
    console.log(`Keeping user:  ${KEEP_EMAIL}`);

    // Guard: never wipe everyone just because the keep-user is missing/typo'd.
    const keepUser = await prisma.user.findUnique({
      where: { email: KEEP_EMAIL },
      select: { id: true, name: true, email: true },
    });
    if (!keepUser) {
      if (!allowMissingKeep) {
        throw new Error(
          `Keep-user "${KEEP_EMAIL}" not found — refusing to delete every user.\n` +
            "  Pass --allow-missing-demo only if you truly want to delete ALL users.",
        );
      }
      console.warn(
        `\n⚠ Keep-user "${KEEP_EMAIL}" not found — --allow-missing-demo set, ALL users will be deleted.`,
      );
    }

    // Report the users that will be removed (with their content counts).
    const victims = await prisma.user.findMany({
      where: { email: { not: KEEP_EMAIL } },
      orderBy: { email: "asc" },
      select: {
        email: true,
        _count: {
          select: {
            items: true,
            collections: true,
            itemTypes: true,
            accounts: true,
            sessions: true,
          },
        },
      },
    });

    const tokenCount = await prisma.verificationToken.count({
      where: { identifier: { not: KEEP_EMAIL } },
    });

    console.log(`\nUsers to delete: ${victims.length}`);
    for (const user of victims) {
      const c = user._count;
      console.log(
        `  - ${user.email}` +
          `  (items ${c.items}, collections ${c.collections}, custom types ${c.itemTypes},` +
          ` accounts ${c.accounts}, sessions ${c.sessions})`,
      );
    }
    console.log(`Verification tokens to delete: ${tokenCount}`);

    if (victims.length === 0 && tokenCount === 0) {
      console.log("\nNothing to delete. ✅");
      return;
    }

    if (!apply) {
      console.log("\nDRY RUN — no changes made. Re-run with `-- --yes` to apply.");
      return;
    }

    // Apply. Run sequentially rather than in a $transaction: these deletes are
    // independent and idempotent, and the project avoids Neon transactions for
    // batched writes (they can hit the P2028 timeout). Re-run to finish if a
    // step fails partway.
    const deletedUsers = await prisma.user.deleteMany({
      where: { email: { not: KEEP_EMAIL } },
    });
    const deletedTokens = await prisma.verificationToken.deleteMany({
      where: { identifier: { not: KEEP_EMAIL } },
    });
    // Tags are shared (not user-owned); remove only those left referencing no items.
    const deletedTags = await prisma.tag.deleteMany({
      where: { items: { none: {} } },
    });

    console.log(
      `\nDeleted ${deletedUsers.count} user(s), ${deletedTokens.count} verification token(s),` +
        ` ${deletedTags.count} orphaned tag(s). ✅`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("\nDelete failed ❌");
  console.error(`  ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
