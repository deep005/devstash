"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { TopBar } from "@/components/layout/top-bar";

/**
 * Client shell that owns the sidebar open/collapsed state and composes the
 * dashboard chrome (sidebar + top bar) around the server-rendered page.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-full flex-1">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
