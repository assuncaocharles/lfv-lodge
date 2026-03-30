import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import {
  getMemberById,
  updateMemberProfile,
  createHistoryEntry,
} from "@/data/membros";

export async function POST(
  req: NextRequest,
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
  const body = await req.json();
  const { grau, cargo } = body as { grau?: string; cargo?: string | null };

  const member = await getMemberById(auth.orgId, id);
  if (!member) {
    return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};

  if (grau && grau !== member.grau) {
    await createHistoryEntry({
      memberProfileId: id,
      campo: "grau",
      valorAnterior: member.grau,
      valorNovo: grau,
      alteradoPor: auth.user.id,
    });
    updates.grau = grau;
  }

  if (cargo !== undefined && cargo !== member.cargo) {
    await createHistoryEntry({
      memberProfileId: id,
      campo: "cargo",
      valorAnterior: member.cargo,
      valorNovo: cargo,
      alteradoPor: auth.user.id,
    });
    updates.cargo = cargo;
  }

  if (Object.keys(updates).length > 0) {
    const updated = await updateMemberProfile(id, updates as Parameters<typeof updateMemberProfile>[1]);
    return NextResponse.json(updated);
  }

  return NextResponse.json(member);
}
