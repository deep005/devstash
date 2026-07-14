import type { LucideIcon } from "lucide-react";

import { ItemRow } from "@/components/items/item-row";
import type { ItemSummary } from "@/lib/db/items";

interface ItemSectionProps {
  title: string;
  icon: LucideIcon;
  items: ItemSummary[];
}

/** A titled section listing item rows (used for Pinned and Recent). */
export function ItemSection({ title, icon: Icon, items }: ItemSectionProps) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
