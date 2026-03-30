"use client";

import { EditPencil, Trash } from "iconoir-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/currency";
import {
  CATEGORIA_LABELS,
  CAIXA_LABELS,
  type CategoriaLancamento,
  type Caixa,
} from "@/lib/tesouraria-constants";

export interface Lancamento {
  id: string;
  caixa: string;
  data: string;
  valor: number;
  tipo: string;
  categoria: string;
  descricao: string | null;
  membroId: string | null;
  mesReferencia: string | null;
  criadoPor: string;
  criadoPorNome: string;
  createdAt: string;
}

interface LancamentosTableProps {
  lancamentos: Lancamento[];
  showCaixa?: boolean;
  onEdit: (l: Lancamento) => void;
  onDelete: (id: string) => void;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

export function LancamentosTable({
  lancamentos,
  showCaixa,
  onEdit,
  onDelete,
}: LancamentosTableProps) {
  if (lancamentos.length === 0) {
    return (
      <div className="rounded-2xl bg-white shadow-card p-8 text-center dark:bg-white/5 dark:ring-1 dark:ring-white/[0.06]">
        <p className="text-[13px] text-neutral-400">
          Nenhum lançamento encontrado neste período.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white shadow-card overflow-hidden dark:bg-white/5 dark:ring-1 dark:ring-white/[0.06]">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-white/[0.06]">
              <th className="text-left px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                Data
              </th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                Tipo
              </th>
              {showCaixa && (
                <th className="text-left px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                  Caixa
                </th>
              )}
              <th className="text-left px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                Categoria
              </th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                Descrição
              </th>
              <th className="text-right px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                Valor
              </th>
              <th className="text-right px-4 py-3 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {lancamentos.map((l) => (
              <tr
                key={l.id}
                className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors dark:border-white/[0.03] dark:hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                  {formatDate(l.data)}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={
                      l.tipo === "credito"
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                    }
                  >
                    {l.tipo === "credito" ? "Crédito" : "Débito"}
                  </Badge>
                </td>
                {showCaixa && (
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                    {CAIXA_LABELS[l.caixa as Caixa]}
                  </td>
                )}
                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                  {CATEGORIA_LABELS[l.categoria as CategoriaLancamento]}
                </td>
                <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300 max-w-[200px] truncate">
                  {l.descricao || "—"}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap">
                  <span
                    className={
                      l.tipo === "credito"
                        ? "text-green-700 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {l.tipo === "credito" ? "+" : "−"} {formatBRL(l.valor)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg"
                      onClick={() => onEdit(l)}
                    >
                      <EditPencil className="size-3.5 text-neutral-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg"
                      onClick={() => onDelete(l.id)}
                    >
                      <Trash className="size-3.5 text-neutral-400" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
