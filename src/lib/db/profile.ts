import { prisma } from "@/lib/prisma";

// Data fetching for the profile page. Server-only (Prisma). Unlike the
// dashboard reads (still demo-user-scoped, see demo-user.ts), these are scoped
// to the actual signed-in user by id.

export interface ProfileTypeCount {
  /** System type name, e.g. "snippet". */
  name: string;
  /** Lucide icon name stored on the item type, e.g. "Code". */
  icon: string;
  /** Hex accent color, e.g. "#3b82f6". */
  color: string;
  /** How many of the user's items have this type. */
  count: number;
}

export interface ProfileData {
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
  /** True for email/password accounts (a stored hash) — gates Change Password. */
  hasPassword: boolean;
  itemCount: number;
  collectionCount: number;
  /** All 7 system types with the user's per-type item counts, canonical order. */
  typeBreakdown: ProfileTypeCount[];
}

/** Canonical display order for the system item types. */
const SYSTEM_TYPE_ORDER = [
  "snippet",
  "prompt",
  "command",
  "note",
  "file",
  "image",
  "link",
];

function typeOrderIndex(name: string): number {
  const index = SYSTEM_TYPE_ORDER.indexOf(name);
  return index === -1 ? SYSTEM_TYPE_ORDER.length : index;
}

/**
 * User info, usage counts, and the per-type item breakdown for the profile
 * page, all scoped to the given user id. Returns null if the user no longer
 * exists (e.g. deleted in another tab). Runs the independent reads in parallel.
 */
export async function getProfileData(
  userId: string,
): Promise<ProfileData | null> {
  const [user, itemCount, collectionCount, types] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
        createdAt: true,
        password: true,
      },
    }),
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({
      where: { isSystem: true },
      select: {
        name: true,
        icon: true,
        color: true,
        // Count only this user's items of the type (filtered relation count).
        _count: { select: { items: { where: { userId } } } },
      },
    }),
  ]);

  if (!user) {
    return null;
  }

  const typeBreakdown = types
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

  return {
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    hasPassword: user.password !== null,
    itemCount,
    collectionCount,
    typeBreakdown,
  };
}
