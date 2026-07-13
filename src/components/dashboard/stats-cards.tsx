import { FileStack, Folder, Star, Sparkles, type LucideIcon } from "lucide-react";

import { collections, items } from "@/lib/mock-data";

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Accent color for the hover glow — distinct per card. */
  accent: string;
}

const stats: Stat[] = [
  { label: "Items", value: items.length, icon: FileStack, accent: "#3b82f6" },
  {
    label: "Collections",
    value: collections.length,
    icon: Folder,
    accent: "#10b981",
  },
  {
    label: "Favorite Items",
    value: items.filter((item) => item.isFavorite).length,
    icon: Star,
    accent: "#f59e0b",
  },
  {
    label: "Favorite Collections",
    value: collections.filter((collection) => collection.isFavorite).length,
    icon: Sparkles,
    accent: "#8b5cf6",
  },
];

/** Four summary tiles across the top of the dashboard. */
export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-200 ease-out hover:scale-[1.03] hover:border-border/70 hover:shadow-lg hover:shadow-black/25"
          >
            {/* Colored blurred glow, distinct per card, revealed on hover. */}
            <div
              aria-hidden
              style={{ backgroundColor: stat.accent }}
              className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
            />
            <div className="relative">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
