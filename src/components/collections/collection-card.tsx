import Link from "next/link";
import { MoreHorizontal, Star } from "lucide-react";

import { getItemTypeIcon } from "@/lib/item-type-icons";
import { getItemTypeById } from "@/lib/item-types";
import type { Collection } from "@/lib/mock-data";

/** A single collection tile with a type-colored accent border. */
export function CollectionCard({ collection }: { collection: Collection }) {
  // Accent color comes from the collection's first item type.
  const accent = getItemTypeById(collection.typeIds[0])?.color;

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
        {collection.itemCount} items
      </p>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
        {collection.description}
      </p>

      <div className="mt-4 flex items-center gap-2.5">
        {collection.typeIds.map((typeId) => {
          const type = getItemTypeById(typeId);
          if (!type) return null;
          const Icon = getItemTypeIcon(type.icon);
          return (
            <Icon
              key={typeId}
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
