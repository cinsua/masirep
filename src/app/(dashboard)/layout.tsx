import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { ProtectedRoute } from "@/components/layout/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SidebarLayout>
        {children}
      </SidebarLayout>
    </ProtectedRoute>
  );
}