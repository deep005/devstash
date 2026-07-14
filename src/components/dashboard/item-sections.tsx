import { Suspense } from "react";
import { Clock, Pin } from "lucide-react";

import { ItemSection } from "@/components/dashboard/item-section";
import { getPinnedItems, getRecentItems } from "@/lib/db/items";

/** How many recent items to surface on the dashboard. */
const RECENT_ITEMS_LIMIT = 10;

/**
 * The dashboard's Pinned and Recent item lists. Both read from the database,
 * so they stream in together behind one skeleton. The skeleton only mimics a
 * single section because the Pinned section renders nothing when no items are
 * pinned — two placeholder headings could resolve to just one list.
 */
export function ItemSections() {
  return (
    <Suspense fallback={<ItemSectionsSkeleton />}>
      <ItemLists />
    </Suspense>
  );
}

async function ItemLists() {
  const [pinnedItems, recentItems] = await Promise.all([
    getPinnedItems(),
    getRecentItems(RECENT_ITEMS_LIMIT),
  ]);

  return (
    <>
      <ItemSection title="Pinned" icon={Pin} items={pinnedItems} />
      <ItemSection title="Recent Items" icon={Clock} items={recentItems} />
    </>
  );
}

/** A pulsing heading bar and rows shown while the item lists load. */
function ItemSectionsSkeleton() {
  return (
    <section>
      <div className="mb-4 h-6 w-32 animate-pulse rounded-md bg-card" />
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-19 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </div>
    </section>
  );
}
