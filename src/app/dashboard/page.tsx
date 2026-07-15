import type { Metadata } from "next";

import { CollectionsSection } from "@/components/dashboard/collections-section";
import { ItemSections } from "@/components/dashboard/item-sections";
import { StatsCards } from "@/components/dashboard/stats-cards";

export const metadata: Metadata = {
  title: "Dashboard · DevStash",
};

// The stats, collections, and item lists read live data from the database, so
// render the dashboard at request time instead of freezing query results into
// the build.
export const dynamic = "force-dynamic";

/**
 * Dashboard main area: stats, collections grid, pinned items, and recent
 * items — all from the database. The sidebar (in the layout) is likewise
 * database-backed.
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
      <ItemSections />
    </div>
  );
}
