import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { getItemDetail } from "@/lib/db/items";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: { item: { findFirst: vi.fn() } },
}));

// The Prisma method is heavily overloaded; treat the mock loosely.
const findFirst = prisma.item.findFirst as unknown as Mock;

describe("getItemDetail", () => {
  beforeEach(() => {
    findFirst.mockReset();
  });

  it("scopes the query to the given item and user", async () => {
    findFirst.mockResolvedValue(null);

    await getItemDetail("item-1", "user-1");

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item-1", userId: "user-1" } }),
    );
  });

  it("flattens tags and collections, sorting collections by name", async () => {
    findFirst.mockResolvedValue({
      id: "item-1",
      title: "useAuth Hook",
      description: "Custom auth hook",
      content: "export function useAuth() {}",
      url: null,
      fileName: null,
      fileSize: null,
      fileUrl: null,
      language: "typescript",
      contentType: "TEXT",
      isFavorite: true,
      isPinned: false,
      createdAt: new Date("2026-01-15T00:00:00Z"),
      updatedAt: new Date("2026-01-16T00:00:00Z"),
      tags: [{ name: "auth" }, { name: "react" }],
      itemType: { name: "snippet", icon: "Code", color: "#3b82f6" },
      collections: [
        { collection: { id: "c-zeta", name: "Zeta" } },
        { collection: { id: "c-alpha", name: "Alpha" } },
      ],
    });

    const detail = await getItemDetail("item-1", "user-1");

    expect(detail).not.toBeNull();
    expect(detail?.tags).toEqual(["auth", "react"]);
    expect(detail?.collections).toEqual([
      { id: "c-alpha", name: "Alpha" },
      { id: "c-zeta", name: "Zeta" },
    ]);
  });

  it("returns null when no item matches (missing or not the user's)", async () => {
    findFirst.mockResolvedValue(null);

    expect(await getItemDetail("missing", "user-1")).toBeNull();
  });
});
