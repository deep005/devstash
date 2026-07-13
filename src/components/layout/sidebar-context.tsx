"use client";

import * as React from "react";

import { useIsMobile } from "@/hooks/use-is-mobile";

interface SidebarContextValue {
  /** Desktop: whether the sidebar rail is expanded. */
  open: boolean;
  /** Mobile: whether the drawer is open. */
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  /** Toggles the drawer on mobile, or the collapse state on desktop. */
  toggleSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(true);
  const [openMobile, setOpenMobile] = React.useState(false);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev);
    } else {
      setOpen((prev) => !prev);
    }
  }, [isMobile]);

  const value = React.useMemo<SidebarContextValue>(
    () => ({ open, openMobile, setOpenMobile, toggleSidebar }),
    [open, openMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
