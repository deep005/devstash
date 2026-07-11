import { Layers } from "lucide-react";

/**
 * Dashboard sidebar.
 *
 * Phase 1: brand header + a placeholder body. The types and collections
 * navigation is added in a later phase.
 */
export function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Layers className="size-4" />
        </span>
        <span className="text-base font-semibold tracking-tight">DevStash</span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h2 className="text-lg font-medium text-muted-foreground">Sidebar</h2>
      </div>
    </aside>
  );
}
