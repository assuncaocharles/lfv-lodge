"use client";

import { Check, Xmark } from "iconoir-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/currency";

interface MensalidadeStatus {
  membroId: string;
  nome: string;
  pago: boolean;
  valor: number | null;
  data: string | null;
  lancamentoId: string | null;
}

interface MensalidadesStatusProps {
  status: MensalidadeStatus[];
  onRegistrar: (membroId: string, nome: string) => void;
}

export function MensalidadesStatus({
  status,
  onRegistrar,
}: MensalidadesStatusProps) {
  const pagos = status.filter((s) => s.pago).length;

  return (
    <div className="rounded-2xl bg-white shadow-card overflow-hidden dark:bg-white/5 dark:ring-1 dark:ring-white/[0.06]">
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-white/[0.06] flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">
          Status das Mensalidades
        </h3>
        <span className="text-[12px] text-neutral-400">
          {pagos}/{status.length} pagos
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-white/[0.06]">
              <th className="text-left px-4 py-2.5 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                Membro
              </th>
              <th className="text-center px-4 py-2.5 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-4 py-2.5 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                Valor
              </th>
              <th className="text-right px-4 py-2.5 font-semibold text-neutral-500 text-[11px] uppercase tracking-wider">
                Ação
              </th>
            </tr>
          </thead>
          <tbody>
            {status.map((s) => (
              <tr
                key={s.membroId}
                className="border-b border-neutral-50 last:border-0 dark:border-white/[0.03]"
              >
                <td className="px-4 py-2.5 text-neutral-700 dark:text-neutral-300">
                  {s.nome}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {s.pago ? (
                    <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 gap-1">
                      <Check className="size-3" />
                      Pago
                    </Badge>
                  ) : (
                    <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 gap-1">
                      <Xmark className="size-3" />
                      Pendente
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-neutral-600 dark:text-neutral-400">
                  {s.valor ? formatBRL(s.valor) : "—"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {!s.pago && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[12px]"
                      onClick={() => onRegistrar(s.membroId, s.nome)}
                    >
                      Registrar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
