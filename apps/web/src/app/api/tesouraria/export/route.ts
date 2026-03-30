import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import {
  getLancamentosParaExport,
  getResumoFinanceiro,
  getSaldoAnterior,
  getTotaisMes,
} from "@/data/tesouraria";
import { formatBRL } from "@/lib/currency";
import {
  CATEGORIA_LABELS,
  CAIXA_LABELS,
  TIPO_LABELS,
  type Caixa,
  type CategoriaLancamento,
  type TipoLancamento,
} from "@/lib/tesouraria-constants";

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
  const formato = sp.get("formato") as "csv" | "xlsx" | "pdf" | null;
  const caixa = sp.get("caixa") as Caixa | null;
  const mes = sp.get("mes");

  if (!formato || !caixa || !mes) {
    return NextResponse.json(
      { error: "Parâmetros obrigatórios: formato, caixa, mes" },
      { status: 400 },
    );
  }

  const [rows, resumo, saldoAnterior, totais] = await Promise.all([
    getLancamentosParaExport(auth.orgId, { caixa, mes }),
    getResumoFinanceiro(auth.orgId, caixa, mes),
    getSaldoAnterior(auth.orgId, caixa, mes),
    getTotaisMes(auth.orgId, caixa, mes),
  ]);

  const saldoAtual = saldoAnterior + totais.creditos - totais.debitos;
  const filename = `tesouraria-${caixa}-${mes}`;

  if (formato === "csv") {
    return buildCsv(rows, resumo, saldoAnterior, saldoAtual, totais, caixa, mes, filename);
  }

  if (formato === "xlsx") {
    const { buildXlsx } = await import("./xlsx-builder");
    return buildXlsx(rows, resumo, saldoAnterior, saldoAtual, totais, caixa, mes, filename);
  }

  if (formato === "pdf") {
    const { buildPdf } = await import("./pdf-builder");
    return buildPdf(rows, resumo, saldoAnterior, saldoAtual, totais, caixa, mes, filename);
  }

  return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
}

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function buildCsv(
  rows: any[],
  resumo: any[],
  saldoAnterior: number,
  saldoAtual: number,
  totais: { creditos: number; debitos: number },
  caixa: Caixa,
  mes: string,
  filename: string,
) {
  const lines: string[] = [];
  lines.push(`${CAIXA_LABELS[caixa]} - ${mes}`);
  lines.push(`Saldo Anterior:;${formatBRL(saldoAnterior)}`);
  lines.push("");
  lines.push("Data;Tipo;Categoria;Descrição;Valor");

  for (const r of rows) {
    const data = formatDate(r.data);
    const tipo = TIPO_LABELS[r.tipo as TipoLancamento];
    const cat = CATEGORIA_LABELS[r.categoria as CategoriaLancamento];
    const desc = (r.descricao || "").replace(/;/g, ",");
    const valor = formatBRL(r.valor);
    lines.push(`${data};${tipo};${cat};${desc};${valor}`);
  }

  lines.push("");
  lines.push("Resumo Financeiro");
  lines.push("Categoria;Crédito;Débito");

  const resumoMap = new Map<string, { credito: number; debito: number }>();
  for (const r of resumo) {
    const entry = resumoMap.get(r.categoria) ?? { credito: 0, debito: 0 };
    entry[r.tipo as "credito" | "debito"] = r.total;
    resumoMap.set(r.categoria, entry);
  }
  for (const [cat, vals] of resumoMap) {
    lines.push(
      `${CATEGORIA_LABELS[cat as CategoriaLancamento]};${formatBRL(vals.credito)};${formatBRL(vals.debito)}`,
    );
  }

  lines.push("");
  lines.push(`Total Créditos:;${formatBRL(totais.creditos)}`);
  lines.push(`Total Débitos:;${formatBRL(totais.debitos)}`);
  lines.push(`Saldo Atual:;${formatBRL(saldoAtual)}`);

  const csv = lines.join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}
