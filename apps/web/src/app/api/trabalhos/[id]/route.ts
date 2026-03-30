import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import { getAssignmentById, getSubmissions, updateAssignment, deleteAssignment } from "@/data/trabalhos";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const [assignment, submissions] = await Promise.all([
    getAssignmentById(auth.orgId, id),
    getSubmissions(id),
  ]);
  if (!assignment) {
    return NextResponse.json({ error: "Trabalho não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ...assignment, submissions });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const assignment = await getAssignmentById(auth.orgId, id);
  if (!assignment) {
    return NextResponse.json({ error: "Trabalho não encontrado" }, { status: 404 });
  }

  // Members can only update status to "em_andamento" or "enviado"
  const admin = await isLuz();
  if (!admin) {
    const allowedStatuses = ["em_andamento", "enviado"];
    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    }
    if (assignment.atribuidoA !== auth.user.id) {
      return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
    }
    const updated = await updateAssignment(id, { status: body.status });
    return NextResponse.json(updated);
  }

  if (body.prazo) body.prazo = new Date(body.prazo);
  const updated = await updateAssignment(id, body);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = await isLuz();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
  }

  const { id } = await params;
  await deleteAssignment(id);
  return NextResponse.json({ success: true });
}
