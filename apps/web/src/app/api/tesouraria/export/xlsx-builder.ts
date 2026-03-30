import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { formatBRL } from "@/lib/currency";
import {
  CATEGORIA_LABELS,
  CAIXA_LABELS,
  TIPO_LABELS,
  type Caixa,
  type CategoriaLancamento,
  type TipoLancamento,
} from "@/lib/tesouraria-constants";

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export function buildXlsx(
  rows: any[],
  resumo: any[],
  saldoAnterior: number,
  saldoAtual: number,
  totais: { creditos: number; debitos: number },
  caixa: Caixa,
  mes: string,
  filename: string,
) {
  const wb = XLSX.utils.book_new();

  // Lancamentos sheet
  const lancData: any[][] = [
    [`${CAIXA_LABELS[caixa]} — ${mes}`],
    [`Saldo Anterior: ${formatBRL(saldoAnterior)}`],
    [],
    ["Data", "Tipo", "Categoria", "Descrição", "Valor"],
  ];

  for (const r of rows) {
    lancData.push([
      formatDate(r.data),
      TIPO_LABELS[r.tipo as TipoLancamento],
      CATEGORIA_LABELS[r.categoria as CategoriaLancamento],
      r.descricao || "",
      formatBRL(r.valor),
    ]);
  }

  lancData.push([]);
  lancData.push([`Total Créditos: ${formatBRL(totais.creditos)}`]);
  lancData.push([`Total Débitos: ${formatBRL(totais.debitos)}`]);
  lancData.push([`Saldo Atual: ${formatBRL(saldoAtual)}`]);

  const ws1 = XLSX.utils.aoa_to_sheet(lancData);
  ws1["!cols"] = [
    { wch: 12 },
    { wch: 10 },
    { wch: 30 },
    { wch: 40 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, "Lançamentos");

  // Resumo sheet
  const resumoData: any[][] = [
    ["Resumo Financeiro"],
    [],
    ["Categoria", "Crédito", "Débito"],
  ];

  const resumoMap = new Map<string, { credito: number; debito: number }>();
  for (const r of resumo) {
    const entry = resumoMap.get(r.categoria) ?? { credito: 0, debito: 0 };
    entry[r.tipo as "credito" | "debito"] = r.total;
    resumoMap.set(r.categoria, entry);
  }
  for (const [cat, vals] of resumoMap) {
    resumoData.push([
      CATEGORIA_LABELS[cat as CategoriaLancamento],
      formatBRL(vals.credito),
      formatBRL(vals.debito),
    ]);
  }

  const ws2 = XLSX.utils.aoa_to_sheet(resumoData);
  ws2["!cols"] = [{ wch: 35 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Resumo");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
    },
  });
}
