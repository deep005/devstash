"use client";

import { createElement } from "react";
import {
  CalendarDays,
  Copy,
  FolderOpen,
  Pencil,
  Pin,
  Star,
  Tag,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import type { DrawerStatus } from "@/components/items/item-drawer-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SheetDescription, SheetTitle } from "@/components/ui/sheet";
import type { ItemDetail } from "@/lib/db/items";
import { formatLongDate } from "@/lib/format";
import { getItemTypeIcon } from "@/lib/item-type-icons";
import { typeLabel } from "@/lib/item-type-slug";
import { cn } from "@/lib/utils";

interface ItemDrawerBodyProps {
  status: DrawerStatus;
  detail: ItemDetail | null;
}

/**
 * The item drawer's contents: a header with the type icon/title/badges, an
 * action bar, and the detail sections. Renders a skeleton while loading and a
 * message on error. The action bar is display-only for now except Copy — the
 * favorite/pin/edit/delete mutations land in a later feature.
 */
export function ItemDrawerBody({ status, detail }: ItemDrawerBodyProps) {
  if (status === "loading" || (status === "loaded" && !detail)) {
    return <ItemDrawerSkeleton />;
  }

  if (status === "error" || !detail) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b p-5 pr-14">
          <SheetTitle className="text-lg font-semibold">
            Couldn&apos;t load item
          </SheetTitle>
          <SheetDescription className="mt-1">
            Something went wrong fetching this item. Please try again.
          </SheetDescription>
        </div>
      </div>
    );
  }

  const accent = detail.itemType.color;
  const copyText = detail.content ?? detail.url ?? "";
  const canCopy = copyText.length > 0;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyText);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start gap-3 border-b p-5 pr-14">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}1a` }}
        >
          {createElement(getItemTypeIcon(detail.itemType.icon), {
            className: "size-5",
            style: { color: accent },
          })}
        </span>
        <div className="min-w-0 flex-1">
          <SheetTitle className="text-lg leading-tight font-semibold">
            {detail.title}
          </SheetTitle>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{typeLabel(detail.itemType.name)}</Badge>
            {detail.language && (
              <Badge variant="outline">{detail.language}</Badge>
            )}
          </div>
          <SheetDescription className="sr-only">
            Full details for {detail.title}.
          </SheetDescription>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-1 border-b px-3 py-2">
        <Button variant="ghost" size="sm">
          <Star
            className={cn(
              "size-4",
              detail.isFavorite && "fill-yellow-400 text-yellow-400",
            )}
          />
          Favorite
        </Button>
        <Button variant="ghost" size="sm">
          <Pin
            className={cn("size-4", detail.isPinned && "fill-current")}
          />
          Pin
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          disabled={!canCopy}
        >
          <Copy className="size-4" />
          Copy
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            aria-label="Delete"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Detail sections */}
      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        {detail.description && (
          <Section label="Description">
            <p className="text-sm text-foreground">{detail.description}</p>
          </Section>
        )}

        <ContentSection detail={detail} />

        {detail.tags.length > 0 && (
          <Section label="Tags" icon={Tag}>
            <div className="flex flex-wrap gap-1.5">
              {detail.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </Section>
        )}

        {detail.collections.length > 0 && (
          <Section label="Collections" icon={FolderOpen}>
            <div className="flex flex-wrap gap-1.5">
              {detail.collections.map((collection) => (
                <Badge key={collection.id} variant="outline">
                  {collection.name}
                </Badge>
              ))}
            </div>
          </Section>
        )}

        <Section label="Details" icon={CalendarDays}>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-medium">{formatLongDate(detail.createdAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Updated</dt>
              <dd className="font-medium">{formatLongDate(detail.updatedAt)}</dd>
            </div>
          </dl>
        </Section>
      </div>
    </div>
  );
}

/** A labeled detail section with an optional leading icon. */
function Section({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </h3>
      {children}
    </section>
  );
}

/**
 * The item's primary content. A syntax-highlighting editor comes later; for now
 * text content is shown as a preformatted block, links as an anchor, and files
 * as their name.
 */
function ContentSection({ detail }: { detail: ItemDetail }) {
  if (detail.contentType === "URL" && detail.url) {
    return (
      <Section label="URL">
        <a
          href={detail.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm break-all text-primary underline-offset-4 hover:underline"
        >
          {detail.url}
        </a>
      </Section>
    );
  }

  if (detail.contentType === "FILE" && detail.fileName) {
    return (
      <Section label="File">
        <p className="text-sm text-foreground">
          {detail.fileName}
          {detail.fileSize != null && (
            <span className="text-muted-foreground">
              {" "}
              ({Math.max(1, Math.round(detail.fileSize / 1024))} KB)
            </span>
          )}
        </p>
      </Section>
    );
  }

  if (detail.content) {
    return (
      <Section label="Content">
        <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-4 text-sm">
          <code>{detail.content}</code>
        </pre>
      </Section>
    );
  }

  return null;
}

/** Skeleton shown while the item detail request is in flight. */
function ItemDrawerSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-3 border-b p-5 pr-14">
        <Skeleton className="size-10 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <SheetTitle className="sr-only">Loading item</SheetTitle>
          <SheetDescription className="sr-only">
            Loading item details.
          </SheetDescription>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-2 border-b px-3 py-2.5">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="flex-1 space-y-6 p-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
