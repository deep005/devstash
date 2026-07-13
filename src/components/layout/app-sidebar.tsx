"use client";

import { SidebarContent } from "@/components/layout/sidebar-content";
import { useSidebar } from "@/components/layout/sidebar-context";
import { cn } from "@/lib/utils";

/**
 * Dashboard sidebar.
 *
 * Desktop (>= md): an in-flow rail that collapses to zero width when toggled.
 * Mobile (< md): an off-canvas drawer with a scrim overlay.
 */
export function AppSidebar() {
  const { open, openMobile, setOpenMobile } = useSidebar();

  return (
    <>
      {/* Desktop rail — collapses width, clipping the fixed-width content. */}
      <aside
        className={cn(
          "hidden shrink-0 overflow-hidden border-sidebar-border transition-[width] duration-200 ease-in-out md:block",
          open ? "w-64 border-r" : "w-0 border-r-0",
        )}
      >
        <div className="h-full w-64">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile scrim */}
      <div
        aria-hidden
        onClick={() => setOpenMobile(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 md:hidden",
          openMobile ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-sidebar-border transition-transform duration-200 ease-in-out md:hidden",
          openMobile ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent onNavigate={() => setOpenMobile(false)} />
      </aside>
    </>
  );
}
