import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, getActiveRole } from "@/lib/api-utils";
import { getMemberByUserId, updateMemberProfile } from "@/data/membros";

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // If no orgId, user is authenticated but not a member
  if (!auth.orgId) {
    return NextResponse.json({
      user: {
        id: auth.user.id,
        name: auth.user.name,
        email: auth.user.email,
        image: auth.user.image ?? null,
      },
      member: null,
    });
  }

  const [member, role] = await Promise.all([
    getMemberByUserId(auth.orgId, auth.user.id),
    getActiveRole(),
  ]);

  const isAdmin = role === "owner" || role === "admin";

  return NextResponse.json({
    user: {
      id: auth.user.id,
      name: auth.user.name,
      email: auth.user.email,
      image: auth.user.image ?? null,
    },
    member: member
      ? {
          profileId: member.id,
          grau: member.grau,
          role: role ?? "member",
          isAdmin,
          telefone: member.telefone,
          cargo: member.cargo,
        }
      : null,
  });
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const member = await getMemberByUserId(auth.orgId, auth.user.id);
  if (!member) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
  }

  const body = await req.json();

  const updated = await updateMemberProfile(member.id, {
    telefone: body.telefone ?? null,
  });

  return NextResponse.json(updated);
}
