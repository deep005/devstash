import { Suspense } from "react";
import {
  FileStack,
  Folder,
  Star,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { getDashboardStats, type DashboardStats } from "@/lib/db/stats";

interface StatCard {
  label: string;
  /** Which count from the dashboard stats this tile shows. */
  statKey: keyof DashboardStats;
  icon: LucideIcon;
  /** Accent color for the hover glow — distinct per card. */
  accent: string;
}

const STAT_CARDS: StatCard[] = [
  { label: "Items", statKey: "itemCount", icon: FileStack, accent: "#3b82f6" },
  {
    label: "Collections",
    statKey: "collectionCount",
    icon: Folder,
    accent: "#10b981",
  },
  {
    label: "Favorite Items",
    statKey: "favoriteItemCount",
    icon: Star,
    accent: "#f59e0b",
  },
  {
    label: "Favorite Collections",
    statKey: "favoriteCollectionCount",
    icon: Sparkles,
    accent: "#8b5cf6",
  },
];

const GRID_CLASSES = "grid grid-cols-2 gap-4 lg:grid-cols-4";

/**
 * Four summary tiles across the top of the dashboard. The counts read from
 * the database, so they stream in behind a skeleton.
 */
export function StatsCards() {
  return (
    <Suspense fallback={<StatsSkeleton />}>
      <StatsGrid />
    </Suspense>
  );
}

async function StatsGrid() {
  const stats = await getDashboardStats();

  return (
    <div className={GRID_CLASSES}>
      {STAT_CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-200 ease-out hover:scale-[1.03] hover:border-border/70 hover:shadow-lg hover:shadow-black/25"
          >
            {/* Colored blurred glow, distinct per card, revealed on hover. */}
            <div
              aria-hidden
              style={{ backgroundColor: card.accent }}
              className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
            />
            <div className="relative">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                  {card.label}
                </span>
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                {stats[card.statKey]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Pulsing placeholder tiles shown while the stats load. */
function StatsSkeleton() {
  return (
    <div className={GRID_CLASSES}>
      {STAT_CARDS.map((card) => (
        <div
          key={card.label}
          className="h-23 animate-pulse rounded-xl border border-border bg-card"
        />
      ))}
    </div>
  );
}
