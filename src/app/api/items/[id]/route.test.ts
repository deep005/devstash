import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

// Isolate the route from NextAuth and Prisma — we only test its glue: the auth
// gate, user-scoping, and status codes.
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/items", () => ({ getItemDetail: vi.fn() }));

import { auth } from "@/auth";
import { getItemDetail } from "@/lib/db/items";
import { GET } from "./route";

const mockAuth = auth as unknown as Mock;
const mockGetItemDetail = getItemDetail as unknown as Mock;

function call(id: string) {
  return GET(new Request(`http://localhost/api/items/${id}`), {
    params: Promise.resolve({ id }),
  });
}

describe("GET /api/items/[id]", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockGetItemDetail.mockReset();
  });

  it("returns 401 and never queries when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const response = await call("item-1");

    expect(response.status).toBe(401);
    expect(mockGetItemDetail).not.toHaveBeenCalled();
  });

  it("scopes the lookup to the session user and 404s when not found", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGetItemDetail.mockResolvedValue(null);

    const response = await call("item-1");

    expect(mockGetItemDetail).toHaveBeenCalledWith("item-1", "user-1");
    expect(response.status).toBe(404);
  });

  it("returns 200 with the item detail when found", async () => {
    const item = { id: "item-1", title: "useAuth Hook" };
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGetItemDetail.mockResolvedValue(item);

    const response = await call("item-1");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(item);
  });
});
