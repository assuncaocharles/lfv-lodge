import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser, getActiveRole } from "@/lib/api-utils";
import { getMemberByUserId, updateMemberProfile } from "@/data/membros";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { member } from "@/db/auth-schema";

export async function GET() {
  const result = await getAuthenticatedUser();
  if (!result) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let orgId = result.orgId;

  // If no active org, try to find and set one
  if (!orgId) {
    const [membership] = await db
      .select()
      .from(member)
      .where(eq(member.userId, result.user.id))
      .limit(1);

    if (!membership) {
      // Authenticated but not a member of any org
      return NextResponse.json({
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          image: result.user.image ?? null,
        },
        member: null,
      });
    }

    // Auto-set the active organization
    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: { organizationId: membership.organizationId },
    });
    orgId = membership.organizationId;
  }

  const [memberProfile, role] = await Promise.all([
    getMemberByUserId(orgId, result.user.id),
    getActiveRole(),
  ]);

  const isAdmin = role === "owner" || role === "admin";

  return NextResponse.json({
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      image: result.user.image ?? null,
    },
    member: memberProfile
      ? {
          profileId: memberProfile.id,
          grau: memberProfile.grau,
          role: role ?? "member",
          isAdmin,
          telefone: memberProfile.telefone,
          cargo: memberProfile.cargo,
        }
      : null,
  });
}

export async function PUT(req: NextRequest) {
  const result = await getAuthenticatedUser();
  if (!result || !result.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const memberProfile = await getMemberByUserId(result.orgId, result.user.id);
  if (!memberProfile) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  const body = await req.json();

  const updated = await updateMemberProfile(memberProfile.id, {
    telefone: body.telefone ?? null,
  });

  return NextResponse.json(updated);
}
