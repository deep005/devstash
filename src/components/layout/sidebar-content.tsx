"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Layers,
  Settings,
  Star,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SidebarCollections } from "@/lib/db/collections";
import type { DemoUser } from "@/lib/db/demo-user";
import type { ItemTypeNav } from "@/lib/db/items";
import { getItemTypeIcon } from "@/lib/item-type-icons";
import { cn } from "@/lib/utils";

/** Capitalized, pluralized label for an item type, e.g. "snippet" → "Snippets". */
function typeLabel(name: string) {
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}s`;
}
/** Route for an item type, e.g. "snippet" → /items/snippets. */
function typeHref(name: string) {
  return `/items/${name}s`;
}

/** Item types gated behind the Pro plan — flagged with a PRO badge in the nav. */
const PRO_TYPE_NAMES = new Set(["file", "image"]);

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
}

function CollapsibleSection({ title, children }: CollapsibleSectionProps) {
  const [open, setOpen] = React.useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-200",
            !open && "-rotate-90",
          )}
        />
      </button>
      {open && <div className="mt-1 space-y-0.5">{children}</div>}
    </div>
  );
}

interface NavRowProps {
  href: string;
  active: boolean;
  onNavigate?: () => void;
  children: React.ReactNode;
}

function NavRow({ href, active, onNavigate, children }: NavRowProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      {children}
    </Link>
  );
}

export interface SidebarContentProps {
  itemTypes: ItemTypeNav[];
  collections: SidebarCollections;
  user: DemoUser | null;
  /** Called when a nav link is clicked — used to close the drawer on mobile. */
  onNavigate?: () => void;
}

export function SidebarContent({
  itemTypes,
  collections,
  user,
  onNavigate,
}: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Layers className="size-4" />
        </span>
        <span className="text-base font-semibold tracking-tight">DevStash</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-4">
        <CollapsibleSection title="Types">
          {itemTypes.map((type) => {
            const Icon = getItemTypeIcon(type.icon);
            const href = typeHref(type.name);
            return (
              <NavRow
                key={type.name}
                href={href}
                active={pathname === href}
                onNavigate={onNavigate}
              >
                <Icon className="size-4 shrink-0" style={{ color: type.color }} />
                <span className="flex-1 truncate">{typeLabel(type.name)}</span>
                {PRO_TYPE_NAMES.has(type.name) && (
                  <Badge
                    variant="secondary"
                    className="h-4 px-1.5 text-[0.625rem] font-semibold tracking-wide text-muted-foreground"
                  >
                    PRO
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground tabular-nums">
                  {type.count}
                </span>
              </NavRow>
            );
          })}
        </CollapsibleSection>

        <div className="mx-2.5 border-t border-sidebar-border" />

        <CollapsibleSection title="Collections">
          {collections.favorites.length > 0 && (
            <>
              <p className="px-2.5 pt-1 pb-0.5 text-[0.7rem] font-medium tracking-wider text-muted-foreground uppercase">
                Favorites
              </p>
              {collections.favorites.map((collection) => {
                const href = `/collections/${collection.id}`;
                return (
                  <NavRow
                    key={collection.id}
                    href={href}
                    active={pathname === href}
                    onNavigate={onNavigate}
                  >
                    <Folder className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{collection.name}</span>
                    <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                  </NavRow>
                );
              })}
            </>
          )}

          {collections.recents.length > 0 && (
            <>
              <p className="px-2.5 pt-2 pb-0.5 text-[0.7rem] font-medium tracking-wider text-muted-foreground uppercase">
                Recent
              </p>
              {collections.recents.map((collection) => {
                const href = `/collections/${collection.id}`;
                return (
                  <NavRow
                    key={collection.id}
                    href={href}
                    active={pathname === href}
                    onNavigate={onNavigate}
                  >
                    <Folder className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{collection.name}</span>
                    {/* Dot colored by the collection's most-used item type. */}
                    {collection.accentColor ? (
                      <span
                        aria-hidden
                        style={{ backgroundColor: collection.accentColor }}
                        className="size-2.5 shrink-0 rounded-full"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="size-2.5 shrink-0 rounded-full bg-muted-foreground/40"
                      />
                    )}
                  </NavRow>
                );
              })}
            </>
          )}

          <Link
            href="/collections"
            onClick={onNavigate}
            className="mt-1 flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>View all collections</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </CollapsibleSection>
      </nav>

      {/* User */}
      {user && (
        <div className="flex shrink-0 items-center gap-3 border-t border-sidebar-border p-3">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name ?? user.email}
              className="size-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {initials(user.name ?? user.email)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name ?? "You"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Settings" asChild>
            <Link href="/settings" onClick={onNavigate}>
              <Settings />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
