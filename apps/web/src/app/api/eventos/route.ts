import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import { getMemberByUserId } from "@/data/membros";
import { getEventsByRange, createEvent } from "@/data/eventos";
import { parseSaoPauloDate } from "@/lib/timezone";

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const member = await getMemberByUserId(auth.orgId, auth.user.id);
  const grau = (member?.grau ?? "1") as "1" | "2" | "3";

  const mes = req.nextUrl.searchParams.get("mes");
  const now = new Date();
  const year = mes ? parseInt(mes.split("-")[0]) : now.getFullYear();
  const month = mes ? parseInt(mes.split("-")[1]) - 1 : now.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);

  const events = await getEventsByRange(auth.orgId, start, end, grau);
  return NextResponse.json(events);
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
  const event = await createEvent({
    organizationId: auth.orgId,
    titulo: body.titulo,
    descricao: body.descricao,
    local: body.local,
    dataInicio: parseSaoPauloDate(body.dataInicio),
    dataFim: body.dataFim ? parseSaoPauloDate(body.dataFim) : undefined,
    diaInteiro: body.diaInteiro,
    grauMinimo: body.grauMinimo,
    criadoPor: auth.user.id,
  });

  return NextResponse.json(event, { status: 201 });
}
