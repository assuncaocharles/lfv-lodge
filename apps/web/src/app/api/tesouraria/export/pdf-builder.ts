import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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

export function buildPdf(
  rows: any[],
  resumo: any[],
  saldoAnterior: number,
  saldoAtual: number,
  totais: { creditos: number; debitos: number },
  caixa: Caixa,
  mes: string,
  filename: string,
) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(16);
  doc.text(`${CAIXA_LABELS[caixa]} — ${mes}`, 14, 20);

  doc.setFontSize(11);
  doc.text(`Saldo Anterior: ${formatBRL(saldoAnterior)}`, 14, 30);

  // Lancamentos table
  const tableData = rows.map((r) => [
    formatDate(r.data),
    TIPO_LABELS[r.tipo as TipoLancamento],
    CATEGORIA_LABELS[r.categoria as CategoriaLancamento],
    r.descricao || "",
    formatBRL(r.valor),
  ]);

  autoTable(doc, {
    startY: 36,
    head: [["Data", "Tipo", "Categoria", "Descrição", "Valor"]],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [13, 21, 37] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 18 },
      2: { cellWidth: 45 },
      3: { cellWidth: 60 },
      4: { cellWidth: 25, halign: "right" },
    },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(10);
  doc.text(`Total Créditos: ${formatBRL(totais.creditos)}`, 14, finalY);
  doc.text(`Total Débitos: ${formatBRL(totais.debitos)}`, 14, finalY + 6);
  doc.setFontSize(11);
  doc.text(`Saldo Atual: ${formatBRL(saldoAtual)}`, 14, finalY + 14);

  // Resumo table
  const resumoMap = new Map<string, { credito: number; debito: number }>();
  for (const r of resumo) {
    const entry = resumoMap.get(r.categoria) ?? { credito: 0, debito: 0 };
    entry[r.tipo as "credito" | "debito"] = r.total;
    resumoMap.set(r.categoria, entry);
  }

  const resumoY = finalY + 24;
  if (resumoY < 260) {
    doc.setFontSize(12);
    doc.text("Resumo Financeiro", 14, resumoY);

    const resumoData = Array.from(resumoMap.entries()).map(([cat, vals]) => [
      CATEGORIA_LABELS[cat as CategoriaLancamento],
      formatBRL(vals.credito),
      formatBRL(vals.debito),
    ]);

    autoTable(doc, {
      startY: resumoY + 4,
      head: [["Categoria", "Crédito", "Débito"]],
      body: resumoData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [13, 21, 37] },
    });
  }

  const buf = doc.output("arraybuffer");
  return new NextResponse(Buffer.from(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}.pdf"`,
    },
  });
}
