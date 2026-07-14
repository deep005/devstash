import Link from "next/link";
import { Suspense } from "react";

import { CollectionCard } from "@/components/collections/collection-card";
import { getRecentCollections } from "@/lib/db/collections";

/** How many recent collections to surface on the dashboard. */
const RECENT_COLLECTIONS_LIMIT = 6;

const GRID_CLASSES = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

/** "Collections" heading + a responsive grid of collection cards. */
export function CollectionsSection() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Collections</h2>
        <Link
          href="/collections"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>

      {/* The grid reads from the database, so it streams in behind a skeleton
          while the heading above renders immediately. */}
      <Suspense fallback={<CollectionsSkeleton />}>
        <CollectionsGrid />
      </Suspense>
    </section>
  );
}

async function CollectionsGrid() {
  const collections = await getRecentCollections(RECENT_COLLECTIONS_LIMIT);

  if (collections.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No collections yet. Create one to organize your items.
      </p>
    );
  }

  return (
    <div className={GRID_CLASSES}>
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}

/** Pulsing placeholder cards shown while the collections grid loads. */
function CollectionsSkeleton() {
  return (
    <div className={GRID_CLASSES}>
      {Array.from({ length: RECENT_COLLECTIONS_LIMIT }, (_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse rounded-xl border border-border bg-card"
        />
      ))}
    </div>
  );
}
