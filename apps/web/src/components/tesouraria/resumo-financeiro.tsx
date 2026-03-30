"use client";

import { formatBRL } from "@/lib/currency";
import {
  CATEGORIA_LABELS,
  type CategoriaLancamento,
} from "@/lib/tesouraria-constants";

interface ResumoItem {
  categoria: string;
  tipo: string;
  total: number;
}

interface ResumoFinanceiroProps {
  resumo: ResumoItem[];
}

export function ResumoFinanceiro({ resumo }: ResumoFinanceiroProps) {
  const map = new Map<string, { credito: number; debito: number }>();
  for (const r of resumo) {
    const entry = map.get(r.categoria) ?? { credito: 0, debito: 0 };
    entry[r.tipo as "credito" | "debito"] = r.total;
    map.set(r.categoria, entry);
  }

  if (map.size === 0) return null;

  let totalCreditos = 0;
  let totalDebitos = 0;
  for (const vals of map.values()) {
    totalCreditos += vals.credito;
    totalDebitos += vals.debito;
  }

  return (
    <div className="rounded-2xl bg-white shadow-card overflow-hidden dark:bg-white/5 dark:ring-1 dark:ring-white/[0.06]">
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-white/[0.06]">
        <h3 className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">
          Resumo Financeiro
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-white/[0.06]">
              <th className="text-left px-4 py-2.5 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                Categoria
              </th>
              <th className="text-right px-4 py-2.5 font-semibold text-green-600 text-[11px] uppercase tracking-wider">
                Crédito
              </th>
              <th className="text-right px-4 py-2.5 font-semibold text-red-500 text-[11px] uppercase tracking-wider">
                Débito
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from(map.entries()).map(([cat, vals]) => (
              <tr
                key={cat}
                className="border-b border-neutral-50 last:border-0 dark:border-white/[0.03]"
              >
                <td className="px-4 py-2.5 text-neutral-700 dark:text-neutral-300">
                  {CATEGORIA_LABELS[cat as CategoriaLancamento]}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-green-700 dark:text-green-400">
                  {vals.credito > 0 ? formatBRL(vals.credito) : "—"}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-red-600 dark:text-red-400">
                  {vals.debito > 0 ? formatBRL(vals.debito) : "—"}
                </td>
              </tr>
            ))}
            <tr className="bg-neutral-50/50 dark:bg-white/[0.02]">
              <td className="px-4 py-2.5 font-semibold text-neutral-800 dark:text-neutral-200">
                Total
              </td>
              <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-green-700 dark:text-green-400">
                {formatBRL(totalCreditos)}
              </td>
              <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-red-600 dark:text-red-400">
                {formatBRL(totalDebitos)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
