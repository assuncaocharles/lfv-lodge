import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-utils";
import { db } from "@/db";
import { member } from "@/db/auth-schema";

/**
 * Landing page after OAuth/login. Checks membership and redirects:
 * - Member → / (dashboard)
 * - Not a member → /solicitar-acesso
 * - No session → /login
 *
 * This avoids redirect chains that cause ERR_FAILED in browsers.
 */
export default async function AuthRedirectPage() {
  const result = await getAuthenticatedUser();

  if (!result) {
    redirect("/login");
  }

  const [membership] = await db
    .select()
    .from(member)
    .where(eq(member.userId, result.user.id))
    .limit(1);

  if (!membership) {
    redirect("/solicitar-acesso");
  }

  redirect("/");
}
