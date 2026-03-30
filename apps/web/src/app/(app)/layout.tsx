import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { member } from "@/db/auth-schema";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  // No session → login
  if (!session) {
    redirect("/login");
  }

  // Check org membership
  const [membership] = await db
    .select()
    .from(member)
    .where(eq(member.userId, session.user.id))
    .limit(1);

  // No membership → request access
  if (!membership) {
    redirect("/solicitar-acesso");
  }

  // Set active org if not set
  if (!session.session.activeOrganizationId) {
    await auth.api.setActiveOrganization({
      headers: reqHeaders,
      body: { organizationId: membership.organizationId },
    });
    redirect("/");
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-5 md:p-8 bg-[var(--app-bg)]">
          {children}
        </main>
      </div>
    </div>
  );
}
