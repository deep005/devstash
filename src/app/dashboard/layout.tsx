import { DashboardShell } from "@/components/layout/dashboard-shell";

/**
 * Dashboard shell: collapsible sidebar on the left, top bar above the main
 * content area. State lives in the client `DashboardShell`; pages render into
 * `children` and stay server components.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
