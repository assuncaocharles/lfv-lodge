import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { member } from "@/db/auth-schema";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Belt-and-suspenders: check membership here too (withAuth on each page
  // is the primary gate, but this catches the layout render)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const [membership] = await db
    .select()
    .from(member)
    .where(eq(member.userId, session.user.id))
    .limit(1);

  if (!membership) {
    redirect("/solicitar-acesso");
  }

  // The shell (Sidebar/Header) is rendered by withAuth, not here.
  // This layout just ensures non-members can't reach any (app) page.
  return <>{children}</>;
}
