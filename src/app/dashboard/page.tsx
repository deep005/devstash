import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard · DevStash",
};

/**
 * Dashboard main area.
 *
 * Phase 1: placeholder only. Collections and recent/pinned items are added in
 * later phases.
 */
export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col">
      <h2 className="text-lg font-medium text-muted-foreground">Main</h2>
    </div>
  );
}
