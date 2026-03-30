export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth is handled by withAuth() on each page.
  // No auth check here — layout redirects cause ERR_FAILED
  // during client-side navigation.
  return <>{children}</>;
}
