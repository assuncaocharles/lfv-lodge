import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return {
    user: session.user,
    orgId: session.session.activeOrganizationId as string | null,
  };
}

export async function getActiveRole(): Promise<string | null> {
  const activeMember = await auth.api.getActiveMember({
    headers: await headers(),
  });
  return activeMember?.role ?? null;
}

export async function isLuz(): Promise<boolean> {
  const role = await getActiveRole();
  return role === "owner" || role === "admin";
}
