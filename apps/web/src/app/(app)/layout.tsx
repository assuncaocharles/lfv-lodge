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
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      console.log("[layout] No session → /login");
      redirect("/login");
    }

    const [membership] = await db
      .select()
      .from(member)
      .where(eq(member.userId, session.user.id))
      .limit(1);

    if (!membership) {
      console.log("[layout] No membership for:", session.user.email, "→ /solicitar-acesso");
      redirect("/solicitar-acesso");
    }

    console.log("[layout] PASS for:", session.user.email);
  } catch (e) {
    // redirect() throws a special NEXT_REDIRECT error — rethrow it
    if (e && typeof e === "object" && "digest" in e) {
      throw e;
    }
    console.error("[layout] Error in auth check:", e);
    redirect("/login");
  }

  return <>{children}</>;
}
