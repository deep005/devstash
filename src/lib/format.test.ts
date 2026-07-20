import { describe, expect, it } from "vitest";

import { formatLongDate, formatShortDate } from "@/lib/format";

describe("formatShortDate", () => {
  it("formats a Date as \"Mon D\"", () => {
    expect(formatShortDate(new Date("2026-07-08T00:00:00Z"))).toBe("Jul 8");
  });

  it("accepts an ISO date string", () => {
    expect(formatShortDate("2026-01-01T00:00:00Z")).toBe("Jan 1");
  });
});

describe("formatLongDate", () => {
  it("formats a Date as \"Month D, YYYY\"", () => {
    expect(formatLongDate(new Date("2026-07-08T00:00:00Z"))).toBe(
      "July 8, 2026",
    );
  });
});
