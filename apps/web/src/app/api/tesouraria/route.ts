import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import { getLancamentos, createLancamento } from "@/data/tesouraria";
import { parseSaoPauloDate } from "@/lib/timezone";
import type { Caixa, CategoriaLancamento, TipoLancamento } from "@/lib/tesouraria-constants";

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = await isLuz();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
  }

  const sp = req.nextUrl.searchParams;
  const rows = await getLancamentos(auth.orgId, {
    caixa: (sp.get("caixa") as Caixa) || undefined,
    mes: sp.get("mes") || undefined,
    categoria: (sp.get("categoria") as CategoriaLancamento) || undefined,
    tipo: (sp.get("tipo") as TipoLancamento) || undefined,
    limit: sp.get("limit") ? parseInt(sp.get("limit")!) : undefined,
    offset: sp.get("offset") ? parseInt(sp.get("offset")!) : undefined,
  });

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = await isLuz();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
  }

  const body = await req.json();

  if (!body.caixa || !body.data || !body.valor || !body.tipo || !body.categoria) {
    return NextResponse.json(
      { error: "Campos obrigatórios: caixa, data, valor, tipo, categoria" },
      { status: 400 },
    );
  }

  const row = await createLancamento({
    organizationId: auth.orgId,
    caixa: body.caixa,
    data: parseSaoPauloDate(body.data),
    valor: body.valor,
    tipo: body.tipo,
    categoria: body.categoria,
    descricao: body.descricao || undefined,
    membroId: body.membroId || undefined,
    mesReferencia: body.mesReferencia || undefined,
    criadoPor: auth.user.id,
  });

  return NextResponse.json(row, { status: 201 });
}
