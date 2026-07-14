import { DEMO_USER_EMAIL } from "@/lib/db/demo-user";
import { prisma } from "@/lib/prisma";

// Data fetching for dashboard item lists. Server-only (Prisma).

export interface ItemTypeSummary {
  name: string;
  /** Lucide icon name stored on the item type, e.g. "Code". */
  icon: string;
  /** Hex accent color, e.g. "#3b82f6". */
  color: string;
}

export interface ItemSummary {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  updatedAt: Date;
  /** Tag names on this item, alphabetical. */
  tags: string[];
  /** The item's type — drives the row's icon and accent color. */
  itemType: ItemTypeSummary;
}

/** The fields an item row needs, shared by every item-list query. */
const ITEM_SUMMARY_SELECT = {
  id: true,
  title: true,
  description: true,
  isFavorite: true,
  isPinned: true,
  updatedAt: true,
  tags: { select: { name: true }, orderBy: { name: "asc" } },
  itemType: { select: { name: true, icon: true, color: true } },
} as const;

/** All pinned items, most recently updated first. */
export async function getPinnedItems(): Promise<ItemSummary[]> {
  const items = await prisma.item.findMany({
    where: { isPinned: true, user: { email: DEMO_USER_EMAIL } },
    orderBy: { updatedAt: "desc" },
    select: ITEM_SUMMARY_SELECT,
  });

  return items.map(toItemSummary);
}

/** The most recently updated items, newest first. */
export async function getRecentItems(limit = 10): Promise<ItemSummary[]> {
  const items = await prisma.item.findMany({
    where: { user: { email: DEMO_USER_EMAIL } },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: ITEM_SUMMARY_SELECT,
  });

  return items.map(toItemSummary);
}

function toItemSummary({
  tags,
  ...item
}: Omit<ItemSummary, "tags"> & { tags: { name: string }[] }): ItemSummary {
  return { ...item, tags: tags.map((tag) => tag.name) };
}
