"use client";

import { createElement } from "react";
import { Pin, Star } from "lucide-react";

import { useItemDrawer } from "@/components/items/item-drawer-provider";
import { formatShortDate } from "@/lib/format";
import { getItemTypeIcon } from "@/lib/item-type-icons";
import type { ItemSummary } from "@/lib/db/items";

/** A single item tile with a type-colored accent border, for grid list pages. */
export function ItemCard({ item }: { item: ItemSummary }) {
  const iconComponent = getItemTypeIcon(item.itemType.icon);
  const accent = item.itemType.color;
  const { openItem } = useItemDrawer();

  return (
    <div
      style={{ borderLeftColor: accent }}
      className="flex cursor-pointer flex-col rounded-xl border border-border border-l-2 bg-card p-5 transition-colors hover:bg-muted/40"
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      onClick={() => openItem(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openItem(item.id);
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}1a` }}
        >
          {createElement(iconComponent, {
            className: "size-4",
            style: { color: accent },
          })}
        </span>

        <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          {item.isPinned && <Pin className="size-3.5" />}
          {item.isFavorite && (
            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
          )}
          {formatShortDate(item.updatedAt)}
        </span>
      </div>

      <h3 className="mt-3 truncate font-medium">{item.title}</h3>

      {item.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>
      )}

      {item.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
