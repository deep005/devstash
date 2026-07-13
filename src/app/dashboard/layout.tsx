import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { TopBar } from "@/components/layout/top-bar";

/**
 * Dashboard shell (server component): collapsible sidebar + top bar wrapped
 * around the server-rendered page. `SidebarProvider` establishes the client
 * boundary for shared sidebar state; only the genuinely interactive pieces
 * beneath it (`AppSidebar`, the top bar's toggle) are client components.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-dvh overflow-hidden">
        <AppSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
