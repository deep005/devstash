"use client";

import { PanelLeft } from "lucide-react";

import { useSidebar } from "@/components/layout/sidebar-context";
import { Button } from "@/components/ui/button";

/**
 * Client island for the top bar: toggles the sidebar (drawer on mobile,
 * collapse on desktop). Kept separate so the top bar itself stays server-side.
 */
export function SidebarToggle() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <PanelLeft />
    </Button>
  );
}
