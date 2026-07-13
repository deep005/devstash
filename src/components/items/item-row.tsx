import { createElement } from "react";
import { Pin, Star } from "lucide-react";

import { formatShortDate } from "@/lib/format";
import { getItemTypeIcon } from "@/lib/item-type-icons";
import { getItemTypeById } from "@/lib/item-types";
import type { Item } from "@/lib/mock-data";

/** A single item row: type icon, title with pin/favorite badges, tags, date. */
export function ItemRow({ item }: { item: Item }) {
  const type = getItemTypeById(item.itemTypeId);
  const iconComponent = getItemTypeIcon(type?.icon ?? "File");
  const accent = type?.color;

  return (
    <div
      style={accent ? { borderLeftColor: accent } : undefined}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-border border-l-2 bg-card p-4 transition-colors hover:bg-muted/40"
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg"
        style={accent ? { backgroundColor: `${accent}1a` } : undefined}
      >
        {createElement(iconComponent, {
          className: "size-4",
          style: { color: accent },
        })}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium">{item.title}</h3>
          {item.isPinned && (
            <Pin className="size-3.5 shrink-0 text-muted-foreground" />
          )}
          {item.isFavorite && (
            <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
          )}
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {formatShortDate(item.updatedAt)}
          </span>
        </div>

        {item.description && (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {item.description}
          </p>
        )}

        {item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
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
    </div>
  );
}
