import { DEMO_USER_EMAIL } from "@/lib/db/demo-user";
import { prisma } from "@/lib/prisma";

// Data fetching for dashboard collections. Server-only (Prisma).

export interface CollectionTypeSummary {
  id: string;
  name: string;
  /** Lucide icon name stored on the item type, e.g. "Code". */
  icon: string;
  /** Hex accent color, e.g. "#3b82f6". */
  color: string;
}

export interface CollectionSummary {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  /** Number of items in this collection. */
  itemCount: number;
  /** Item types present in this collection, most-used first. */
  itemTypes: CollectionTypeSummary[];
}

/** The most recently updated collections, newest first. */
export async function getRecentCollections(
  limit = 6,
): Promise<CollectionSummary[]> {
  const collections = await prisma.collection.findMany({
    where: { user: { email: DEMO_USER_EMAIL } },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      _count: { select: { items: true } },
      items: {
        select: {
          item: {
            select: {
              itemType: {
                select: { id: true, name: true, icon: true, color: true },
              },
            },
          },
        },
      },
    },
  });

  return collections.map((collection) => {
    // Tally how often each item type occurs, so the card can accent by the
    // most-used type and show one icon per distinct type.
    const typeCounts = new Map<
      string,
      { type: CollectionTypeSummary; count: number }
    >();
    for (const { item } of collection.items) {
      const entry = typeCounts.get(item.itemType.id);
      if (entry) {
        entry.count += 1;
      } else {
        typeCounts.set(item.itemType.id, { type: item.itemType, count: 1 });
      }
    }

    const itemTypes = [...typeCounts.values()]
      .sort(
        (a, b) => b.count - a.count || a.type.name.localeCompare(b.type.name),
      )
      .map((entry) => entry.type);

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isFavorite: collection.isFavorite,
      itemCount: collection._count.items,
      itemTypes,
    };
  });
}
