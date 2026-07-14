import Link from "next/link";
import { MoreHorizontal, Star } from "lucide-react";

import { getItemTypeIcon } from "@/lib/item-type-icons";
import type { CollectionSummary } from "@/lib/db/collections";

/** A single collection tile with a type-colored accent border. */
export function CollectionCard({
  collection,
}: {
  collection: CollectionSummary;
}) {
  // Accent color comes from the collection's most-used item type.
  const accent = collection.itemTypes[0]?.color;

  return (
    <Link
      href={`/collections/${collection.id}`}
      style={accent ? { borderLeftColor: accent } : undefined}
      className="group flex cursor-pointer flex-col rounded-xl border border-border border-l-2 bg-card p-5 transition-colors hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate font-medium">{collection.name}</h3>
          {collection.isFavorite && (
            <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
          )}
        </div>
        <MoreHorizontal className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
      </p>

      {collection.description && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {collection.description}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2.5">
        {collection.itemTypes.map((type) => {
          const Icon = getItemTypeIcon(type.icon);
          return (
            <Icon
              key={type.id}
              className="size-4"
              style={{ color: type.color }}
              aria-label={type.name}
            />
          );
        })}
      </div>
    </Link>
  );
}
