import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import {
  getLancamentoById,
  updateLancamento,
  deleteLancamento,
} from "@/data/tesouraria";
import { parseSaoPauloDate } from "@/lib/timezone";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = await isLuz();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
  }

  const { id } = await params;
  const row = await getLancamentoById(auth.orgId, id);
  if (!row) {
    return NextResponse.json({ error: "Lançamento não encontrado" }, { status: 404 });
  }

  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = await isLuz();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await getLancamentoById(auth.orgId, id);
  if (!existing) {
    return NextResponse.json({ error: "Lançamento não encontrado" }, { status: 404 });
  }

  const body = await req.json();
  const row = await updateLancamento(id, {
    data: body.data ? parseSaoPauloDate(body.data) : undefined,
    valor: body.valor,
    tipo: body.tipo,
    categoria: body.categoria,
    descricao: body.descricao,
    membroId: body.membroId,
    mesReferencia: body.mesReferencia,
  });

  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = await isLuz();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await getLancamentoById(auth.orgId, id);
  if (!existing) {
    return NextResponse.json({ error: "Lançamento não encontrado" }, { status: 404 });
  }

  await deleteLancamento(id);
  return NextResponse.json({ ok: true });
}
