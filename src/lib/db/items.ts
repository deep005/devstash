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

export interface ItemTypePageData {
  itemType: ItemTypeSummary;
  items: ItemSummary[];
}

/**
 * A system item type's display metadata plus the user's items of that type,
 * newest first — powers the `/items/[type]` list page. Returns null if
 * `typeName` isn't a known system type.
 */
export async function getItemsByType(
  typeName: string,
): Promise<ItemTypePageData | null> {
  const [itemType, items] = await Promise.all([
    prisma.itemType.findFirst({
      where: { name: typeName, isSystem: true },
      select: { name: true, icon: true, color: true },
    }),
    prisma.item.findMany({
      where: { itemType: { name: typeName }, user: { email: DEMO_USER_EMAIL } },
      orderBy: { updatedAt: "desc" },
      select: ITEM_SUMMARY_SELECT,
    }),
  ]);

  if (!itemType) return null;

  return { itemType, items: items.map(toItemSummary) };
}

function toItemSummary({
  tags,
  ...item
}: Omit<ItemSummary, "tags"> & { tags: { name: string }[] }): ItemSummary {
  return { ...item, tags: tags.map((tag) => tag.name) };
}

/** A collection an item belongs to, for the item drawer's memberships list. */
export interface ItemDetailCollection {
  id: string;
  name: string;
}

/** Full detail for a single item — powers the item drawer. */
export interface ItemDetail {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileUrl: string | null;
  language: string | null;
  contentType: "TEXT" | "FILE" | "URL";
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  /** Tag names on this item, alphabetical. */
  tags: string[];
  /** The item's type — drives the drawer icon and accent color. */
  itemType: ItemTypeSummary;
  /** Collections this item belongs to, alphabetical. */
  collections: ItemDetailCollection[];
}

/**
 * Full detail for a single item, scoped to the given user — powers the item
 * drawer (fetched on click via `GET /api/items/[id]`). Returns null if the item
 * doesn't exist or doesn't belong to the user, so the caller can 404.
 */
export async function getItemDetail(
  itemId: string,
  userId: string,
): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      url: true,
      fileName: true,
      fileSize: true,
      fileUrl: true,
      language: true,
      contentType: true,
      isFavorite: true,
      isPinned: true,
      createdAt: true,
      updatedAt: true,
      tags: { select: { name: true }, orderBy: { name: "asc" } },
      itemType: { select: { name: true, icon: true, color: true } },
      collections: {
        select: { collection: { select: { id: true, name: true } } },
      },
    },
  });

  if (!item) return null;

  return {
    ...item,
    tags: item.tags.map((tag) => tag.name),
    collections: item.collections
      .map((entry) => entry.collection)
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export interface ItemTypeNav {
  name: string;
  /** Lucide icon name stored on the item type, e.g. "Code". */
  icon: string;
  /** Hex accent color, e.g. "#3b82f6". */
  color: string;
  /** How many of the user's items have this type. */
  count: number;
}

/** Canonical display order for the system item types in the sidebar. */
const SYSTEM_TYPE_ORDER = [
  "snippet",
  "prompt",
  "command",
  "note",
  "file",
  "image",
  "link",
];

/**
 * The system item types with the user's per-type item counts, in canonical
 * order — drives the sidebar's "Types" navigation. Types with no items are
 * still listed (count 0) so the nav stays a complete type index.
 */
export async function getItemTypesWithCounts(): Promise<ItemTypeNav[]> {
  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    select: {
      name: true,
      icon: true,
      color: true,
      // Count only the demo user's items of this type (filtered relation count).
      _count: {
        select: { items: { where: { user: { email: DEMO_USER_EMAIL } } } },
      },
    },
  });

  return types
    .map((type) => ({
      name: type.name,
      icon: type.icon,
      color: type.color,
      count: type._count.items,
    }))
    .sort(
      (a, b) =>
        typeOrderIndex(a.name) - typeOrderIndex(b.name) ||
        a.name.localeCompare(b.name),
    );
}

function typeOrderIndex(name: string): number {
  const index = SYSTEM_TYPE_ORDER.indexOf(name);
  return index === -1 ? SYSTEM_TYPE_ORDER.length : index;
}
