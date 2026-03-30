import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "./api-utils";
import { db } from "@/db";
import { member } from "@/db/auth-schema";
import { memberProfile } from "@/db/app-schema";
import { eq, and } from "drizzle-orm";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

type AuthResult = NonNullable<
  Awaited<ReturnType<typeof getAuthenticatedUser>>
>;

type AuthenticatedUser = AuthResult["user"];
type Role = "owner" | "admin" | "member";

export interface MemberInfo {
  grau: "1" | "2" | "3";
  role: string;
  profileId: string | null;
  isAdmin: boolean;
}

interface WithAuthOptions {
  roles?: Role[];
}

export function withAuth<TProps extends object>(
  Page: (
    props: TProps & {
      user: AuthenticatedUser;
      orgId: string;
      member: MemberInfo;
    },
  ) => Promise<React.ReactNode>,
  options?: WithAuthOptions,
) {
  return async function AuthenticatedPage(props: TProps) {
    // Step 1: Check authentication
    const result = await getAuthenticatedUser();
    if (!result) redirect("/login");

    const reqHeaders = await headers();

    // Step 2: ALWAYS check membership in DB — regardless of orgId in session
    const [membership] = await db
      .select()
      .from(member)
      .where(eq(member.userId, result.user.id))
      .limit(1);

    if (!membership) {
      // User is authenticated but NOT authorized (no org membership)
      redirect("/solicitar-acesso");
    }

    // Step 3: Ensure active org is set
    if (!result.orgId) {
      await auth.api.setActiveOrganization({
        headers: reqHeaders,
        body: { organizationId: membership.organizationId },
      });
      redirect("/");
    }

    // Step 4: Verify the active org matches the membership
    if (result.orgId !== membership.organizationId) {
      await auth.api.setActiveOrganization({
        headers: reqHeaders,
        body: { organizationId: membership.organizationId },
      });
      redirect("/");
    }

    // Step 5: Check role permissions
    if (
      options?.roles &&
      !options.roles.includes(membership.role as Role)
    ) {
      redirect("/");
    }

    // Step 6: Fetch member profile for grau
    const [profile] = await db
      .select({ id: memberProfile.id, grau: memberProfile.grau })
      .from(memberProfile)
      .where(
        and(
          eq(memberProfile.userId, result.user.id),
          eq(memberProfile.organizationId, membership.organizationId),
        ),
      )
      .limit(1);

    const isAdmin =
      membership.role === "owner" || membership.role === "admin";

    const memberInfo: MemberInfo = {
      grau: (profile?.grau as "1" | "2" | "3") ?? "1",
      role: membership.role,
      profileId: profile?.id ?? null,
      isAdmin,
    };

    // Step 7: Render dashboard shell + page content
    // Shell is here (not in layout) so it ONLY renders after auth passes
    const pageContent = await Page({
      ...props,
      user: result.user,
      orgId: membership.organizationId,
      member: memberInfo,
    });

    return (
      <div className="flex h-full">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-auto p-5 md:p-8 bg-[var(--app-bg)]">
            {pageContent}
          </main>
        </div>
      </div>
    );
  };
}
