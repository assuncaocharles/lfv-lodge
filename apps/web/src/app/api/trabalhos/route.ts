import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import { getAssignments, createAssignment } from "@/data/trabalhos";

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const admin = await isLuz();
  const assignments = admin
    ? await getAssignments(auth.orgId)
    : await getAssignments(auth.orgId, auth.user.id);

  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const admin = await isLuz();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
  }

  const body = await req.json();
  const assignment = await createAssignment({
    organizationId: auth.orgId,
    titulo: body.titulo,
    descricao: body.descricao,
    prazo: body.prazo ? new Date(body.prazo) : undefined,
    atribuidoA: body.atribuidoA,
    criadoPor: auth.user.id,
  });

  return NextResponse.json(assignment, { status: 201 });
}
