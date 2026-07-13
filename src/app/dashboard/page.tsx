import type { Metadata } from "next";
import { Clock, Pin } from "lucide-react";

import { CollectionsSection } from "@/components/dashboard/collections-section";
import { ItemSection } from "@/components/dashboard/item-section";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { items } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Dashboard · DevStash",
};

/** How many recent items to surface. */
const RECENT_ITEMS_LIMIT = 10;

const pinnedItems = items.filter((item) => item.isPinned);
const recentItems = [...items]
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  .slice(0, RECENT_ITEMS_LIMIT);

/**
 * Dashboard main area: stats, collections grid, pinned items, and recent items.
 * Data is read directly from mock-data until the database is wired up.
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Your developer knowledge hub
        </p>
      </header>

      <StatsCards />
      <CollectionsSection />
      <ItemSection title="Pinned" icon={Pin} items={pinnedItems} />
      <ItemSection title="Recent Items" icon={Clock} items={recentItems} />
    </div>
  );
}
