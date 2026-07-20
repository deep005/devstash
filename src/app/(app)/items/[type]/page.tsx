import { createElement } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ItemCard } from "@/components/items/item-card";
import { getItemsByType } from "@/lib/db/items";
import { getItemTypeIcon } from "@/lib/item-type-icons";
import { resolveTypeSlug, typeLabel } from "@/lib/item-type-slug";

interface ItemTypePageProps {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({
  params,
}: ItemTypePageProps): Promise<Metadata> {
  const { type: slug } = await params;
  const typeName = resolveTypeSlug(slug);
  return { title: typeName ? `${typeLabel(typeName)} · DevStash` : "DevStash" };
}

// Item lists read live data from the database, so render at request time
// instead of freezing query results into the build.
export const dynamic = "force-dynamic";

export default async function ItemTypePage({ params }: ItemTypePageProps) {
  const { type: slug } = await params;
  const typeName = resolveTypeSlug(slug);
  if (!typeName) notFound();

  const data = await getItemsByType(typeName);
  if (!data) notFound();

  const { itemType, items } = data;
  const label = typeLabel(itemType.name);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex items-center gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${itemType.color}1a` }}
        >
          {createElement(getItemTypeIcon(itemType.icon), {
            className: "size-5",
            style: { color: itemType.color },
          })}
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{label}</h1>
          <p className="mt-1 text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No {label.toLowerCase()} yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
