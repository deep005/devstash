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

export interface SidebarCollection {
  id: string;
  name: string;
  /**
   * Hex color of the collection's most-used item type, shown as a dot next to
   * recent collections. Null when the collection has no items.
   */
  accentColor: string | null;
}

export interface SidebarCollections {
  /** Favorite collections — shown with a star. */
  favorites: SidebarCollection[];
  /** Most recently updated non-favorites — shown with a most-used-type dot. */
  recents: SidebarCollection[];
}

/** How many recent (non-favorite) collections to surface in the sidebar. */
const SIDEBAR_RECENT_LIMIT = 5;

/**
 * Collections for the sidebar: all favorites plus the most recently updated
 * non-favorites. Favorites don't need an accent (they show a star), so only
 * the recents carry the item-type aggregation.
 */
export async function getSidebarCollections(): Promise<SidebarCollections> {
  const byDemoUser = { user: { email: DEMO_USER_EMAIL } };

  // Two independent reads — run them in parallel. (Not a $transaction: these
  // don't need a consistent snapshot, and reserving a transaction connection
  // can time out under connection contention / a cold serverless database.)
  const [favorites, recents] = await Promise.all([
    prisma.collection.findMany({
      where: { ...byDemoUser, isFavorite: true },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true },
    }),
    prisma.collection.findMany({
      where: { ...byDemoUser, isFavorite: false },
      orderBy: { updatedAt: "desc" },
      take: SIDEBAR_RECENT_LIMIT,
      select: {
        id: true,
        name: true,
        items: {
          select: {
            item: { select: { itemType: { select: { name: true, color: true } } } },
          },
        },
      },
    }),
  ]);

  return {
    favorites: favorites.map((collection) => ({
      id: collection.id,
      name: collection.name,
      accentColor: null,
    })),
    recents: recents.map((collection) => ({
      id: collection.id,
      name: collection.name,
      accentColor: mostUsedTypeColor(collection.items),
    })),
  };
}

/**
 * The color of a collection's most-used item type. Ties break by type name
 * (ascending), matching {@link getRecentCollections}.
 */
function mostUsedTypeColor(
  items: { item: { itemType: { name: string; color: string } } }[],
): string | null {
  const counts = new Map<string, { color: string; count: number }>();
  for (const { item } of items) {
    const { name, color } = item.itemType;
    const entry = counts.get(name);
    if (entry) {
      entry.count += 1;
    } else {
      counts.set(name, { color, count: 1 });
    }
  }

  const top = [...counts.entries()].sort(
    (a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]),
  )[0];

  return top ? top[1].color : null;
}
