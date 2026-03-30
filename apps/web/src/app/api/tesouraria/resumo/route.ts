import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import {
  getResumoFinanceiro,
  getSaldoAnterior,
  getTotaisMes,
} from "@/data/tesouraria";
import type { Caixa } from "@/lib/tesouraria-constants";

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
  const caixa = sp.get("caixa") as Caixa | null;
  const mes = sp.get("mes");

  if (!caixa || !mes) {
    return NextResponse.json(
      { error: "Parâmetros obrigatórios: caixa, mes" },
      { status: 400 },
    );
  }

  const [resumo, saldoAnterior, totais] = await Promise.all([
    getResumoFinanceiro(auth.orgId, caixa, mes),
    getSaldoAnterior(auth.orgId, caixa, mes),
    getTotaisMes(auth.orgId, caixa, mes),
  ]);

  return NextResponse.json({
    resumo,
    saldoAnterior,
    totalCreditos: totais.creditos,
    totalDebitos: totais.debitos,
    saldoAtual: saldoAnterior + totais.creditos - totais.debitos,
  });
}
