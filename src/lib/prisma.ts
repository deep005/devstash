import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 requires a driver adapter. We use the pg adapter against Neon.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Cache the client on globalThis in development so Next.js hot-reload does not
// spawn a new PrismaClient (and connection pool) on every module reload.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
