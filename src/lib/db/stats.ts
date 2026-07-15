import { DEMO_USER_EMAIL } from "@/lib/db/demo-user";
import { prisma } from "@/lib/prisma";

// Data fetching for the dashboard stat tiles. Server-only (Prisma).

export interface DashboardStats {
  itemCount: number;
  collectionCount: number;
  favoriteItemCount: number;
  favoriteCollectionCount: number;
}

/** Item and collection counts for the dashboard stat tiles. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const byDemoUser = { user: { email: DEMO_USER_EMAIL } };

  // Four independent counts — run them in parallel. (Not a $transaction: these
  // don't need a consistent snapshot, and reserving a transaction connection
  // can time out under connection contention / a cold serverless database.)
  const [itemCount, collectionCount, favoriteItemCount, favoriteCollectionCount] =
    await Promise.all([
      prisma.item.count({ where: byDemoUser }),
      prisma.collection.count({ where: byDemoUser }),
      prisma.item.count({ where: { ...byDemoUser, isFavorite: true } }),
      prisma.collection.count({ where: { ...byDemoUser, isFavorite: true } }),
    ]);

  return {
    itemCount,
    collectionCount,
    favoriteItemCount,
    favoriteCollectionCount,
  };
}
