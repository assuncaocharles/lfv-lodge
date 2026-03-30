import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-utils";
import { getMemberByUserId, updateMemberProfile } from "@/data/membros";

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const member = await getMemberByUserId(auth.orgId, auth.user.id);
  return NextResponse.json({
    user: {
      id: auth.user.id,
      name: auth.user.name,
      email: auth.user.email,
      image: auth.user.image,
    },
    profile: member
      ? {
          id: member.id,
          telefone: member.telefone,
          grau: member.grau,
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

  // Only allow updating own telefone
  const updated = await updateMemberProfile(member.id, {
    telefone: body.telefone ?? null,
  });

  return NextResponse.json(updated);
}
