export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No auth here — withAuth on each page handles it
  // Sidebar/Header are rendered by DashboardShell inside withAuth
  return <>{children}</>;
}
