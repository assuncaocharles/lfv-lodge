"use client";

import { formatBRL } from "@/lib/currency";

interface SaldoCardProps {
  saldoAnterior: number;
  totalCreditos: number;
  totalDebitos: number;
  saldoAtual: number;
}

export function SaldoCard({
  saldoAnterior,
  totalCreditos,
  totalDebitos,
  saldoAtual,
}: SaldoCardProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="rounded-2xl bg-white shadow-card p-4 dark:bg-white/5 dark:ring-1 dark:ring-white/[0.06]">
        <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
          Saldo Anterior
        </p>
        <p className="text-lg font-semibold text-neutral-900 mt-1 dark:text-white">
          {formatBRL(saldoAnterior)}
        </p>
      </div>
      <div className="rounded-2xl bg-white shadow-card p-4 dark:bg-white/5 dark:ring-1 dark:ring-white/[0.06]">
        <p className="text-[11px] font-medium text-green-600 uppercase tracking-wider">
          Créditos
        </p>
        <p className="text-lg font-semibold text-green-700 mt-1 dark:text-green-400">
          {formatBRL(totalCreditos)}
        </p>
      </div>
      <div className="rounded-2xl bg-white shadow-card p-4 dark:bg-white/5 dark:ring-1 dark:ring-white/[0.06]">
        <p className="text-[11px] font-medium text-red-500 uppercase tracking-wider">
          Débitos
        </p>
        <p className="text-lg font-semibold text-red-600 mt-1 dark:text-red-400">
          {formatBRL(totalDebitos)}
        </p>
      </div>
      <div className="rounded-2xl bg-white shadow-card p-4 dark:bg-white/5 dark:ring-1 dark:ring-white/[0.06]">
        <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
          Saldo Atual
        </p>
        <p
          className={`text-lg font-semibold mt-1 ${
            saldoAtual >= 0
              ? "text-neutral-900 dark:text-white"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatBRL(saldoAtual)}
        </p>
      </div>
    </div>
  );
}
