import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { TopBar } from "@/components/layout/top-bar";
import { getSidebarCollections } from "@/lib/db/collections";
import { getDemoUser } from "@/lib/db/demo-user";
import { getItemTypesWithCounts } from "@/lib/db/items";

// The sidebar reads live item types, collections, and user from the database,
// so the shell must render at request time instead of freezing query results
// into the build.
export const dynamic = "force-dynamic";

/**
 * Dashboard shell (server component): collapsible sidebar + top bar wrapped
 * around the server-rendered page. Sidebar data is fetched here and passed to
 * `AppSidebar`; `SidebarProvider` establishes the client boundary for shared
 * sidebar state, and only the genuinely interactive pieces beneath it
 * (`AppSidebar`, the top bar's toggle) are client components.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [itemTypes, collections, user] = await Promise.all([
    getItemTypesWithCounts(),
    getSidebarCollections(),
    getDemoUser(),
  ]);

  return (
    <SidebarProvider>
      <div className="flex h-dvh overflow-hidden">
        <AppSidebar
          itemTypes={itemTypes}
          collections={collections}
          user={user}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
