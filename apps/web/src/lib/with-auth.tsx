import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAuthenticatedUser } from "./api-utils";
import { db } from "@/db";
import { member } from "@/db/auth-schema";
import { memberProfile } from "@/db/app-schema";
import { eq, and } from "drizzle-orm";

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
    const result = await getAuthenticatedUser();
    if (!result) redirect("/login");

    const reqHeaders = await headers();

    // Auto-set active org if not set (single-tenant: pick the first org)
    if (!result.orgId) {
      const [membership] = await db
        .select()
        .from(member)
        .where(eq(member.userId, result.user.id))
        .limit(1);

      if (!membership) redirect("/login");

      await auth.api.setActiveOrganization({
        headers: reqHeaders,
        body: { organizationId: membership.organizationId },
      });

      redirect("/");
    }

    const activeMember = await auth.api.getActiveMember({
      headers: reqHeaders,
    });

    if (!activeMember) {
      redirect("/login");
    }

    if (options?.roles && !options.roles.includes(activeMember.role as Role)) {
      redirect("/");
    }

    // Fetch member profile for grau
    const [profile] = await db
      .select({ id: memberProfile.id, grau: memberProfile.grau })
      .from(memberProfile)
      .where(
        and(
          eq(memberProfile.userId, result.user.id),
          eq(memberProfile.organizationId, result.orgId),
        ),
      )
      .limit(1);

    const isAdmin =
      activeMember.role === "owner" || activeMember.role === "admin";

    const memberInfo: MemberInfo = {
      grau: (profile?.grau as "1" | "2" | "3") ?? "1",
      role: activeMember.role,
      profileId: profile?.id ?? null,
      isAdmin,
    };

    return Page({
      ...props,
      user: result.user,
      orgId: result.orgId,
      member: memberInfo,
    });
  };
}
