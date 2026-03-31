"use client";

import { useState, useCallback } from "react";
import { useMember } from "@/hooks/use-member";
import { useFetch } from "@/hooks/use-fetch";
import { cn } from "@/lib/utils";
import { SaldoCard } from "@/components/tesouraria/saldo-card";
import { MesNavigator } from "@/components/tesouraria/mes-navigator";
import {
  LancamentosTable,
  type Lancamento,
} from "@/components/tesouraria/lancamentos-table";
import {
  LancamentoForm,
  LancamentoFormTrigger,
} from "@/components/tesouraria/lancamento-form";
import { ResumoFinanceiro } from "@/components/tesouraria/resumo-financeiro";
import { MensalidadesStatus } from "@/components/tesouraria/mensalidades-status";
import { ExportButton } from "@/components/tesouraria/export-button";
import {
  CAIXA_LABELS,
  type Caixa,
  type CategoriaLancamento,
  type TipoLancamento,
} from "@/lib/tesouraria-constants";

function getCurrentMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

interface ResumoData {
  resumo: { categoria: string; tipo: string; total: number }[];
  saldoAnterior: number;
  totalCreditos: number;
  totalDebitos: number;
  saldoAtual: number;
}

export default function TesourariaPage() {
  const { member } = useMember();
  const [caixa, setCaixa] = useState<Caixa>("loja");
  const [mes, setMes] = useState(getCurrentMonth);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<Lancamento | null>(null);

  const {
    data: lancamentos,
    isLoading: loadingLanc,
    mutate: mutateLanc,
  } = useFetch<Lancamento[]>(`/api/tesouraria?caixa=${caixa}&mes=${mes}`);

  const {
    data: resumo,
    isLoading: loadingResumo,
    mutate: mutateResumo,
  } = useFetch<ResumoData>(`/api/tesouraria/resumo?caixa=${caixa}&mes=${mes}`);

  const { data: membros } = useFetch<{ id: string; nome: string }[]>(
    caixa === "mensalidades" ? "/api/membros" : null,
  );

  const { data: mensalidadesStatus, mutate: mutateMens } = useFetch<any[]>(
    caixa === "mensalidades"
      ? `/api/tesouraria/mensalidades/status?mes=${mes}`
      : null,
  );

  const membrosForForm =
    membros?.map((m: any) => ({ id: m.profileId ?? m.id, nome: m.userName ?? m.nome })) ?? [];

  const refreshAll = useCallback(() => {
    mutateLanc();
    mutateResumo();
    if (caixa === "mensalidades") mutateMens();
  }, [mutateLanc, mutateResumo, mutateMens, caixa]);

  const handleSubmit = useCallback(
    async (data: {
      caixa: Caixa;
      data: string;
      valor: number;
      tipo: TipoLancamento;
      categoria: CategoriaLancamento;
      descricao?: string;
      membroId?: string;
      mesReferencia?: string;
    }) => {
      const url = editData
        ? `/api/tesouraria/${editData.id}`
        : "/api/tesouraria";
      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ?? "Erro ao salvar lançamento");
      }

      setEditData(null);
      refreshAll();
    },
    [editData, refreshAll],
  );

  const handleEdit = useCallback((l: Lancamento) => {
    setEditData(l);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Tem certeza que deseja excluir este lançamento?")) return;
      await fetch(`/api/tesouraria/${id}`, { method: "DELETE" });
      refreshAll();
    },
    [refreshAll],
  );

  const handleRegistrarMensalidade = useCallback(
    (membroId: string, nome: string) => {
      setEditData(null);
      setCaixa("mensalidades");
      setFormOpen(true);
      // Pre-fill will be handled by the form's useEffect resetting on open
      setTimeout(() => {
        // We set the form to open with mensalidades caixa context
      }, 0);
    },
    [],
  );

  if (!member.isAdmin) {
    return (
      <div className="bg-red-50 text-red-600 rounded-2xl p-6 text-[13px]">
        Acesso restrito à administração.
      </div>
    );
  }

  const isLoading = loadingLanc || loadingResumo;

  return (
    <>
      {isLoading ? (
        <div className="space-y-6 animate-fade-up">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-card h-20" />
              ))}
            </div>
            <div className="bg-white rounded-2xl shadow-card h-12" />
            <div className="bg-white rounded-2xl shadow-card h-64" />
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-up">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-neutral-900 tracking-tight dark:text-white">
                Tesouraria
              </h1>
              <p className="text-[13px] text-neutral-500 mt-1">
                Controle financeiro da loja
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ExportButton caixa={caixa} mes={mes} />
              <LancamentoFormTrigger
                onClick={() => {
                  setEditData(null);
                  setFormOpen(true);
                }}
              />
            </div>
          </div>

          {/* Saldo Cards */}
          {resumo && (
            <SaldoCard
              saldoAnterior={resumo.saldoAnterior}
              totalCreditos={resumo.totalCreditos}
              totalDebitos={resumo.totalDebitos}
              saldoAtual={resumo.saldoAtual}
            />
          )}

          {/* Caixa Toggle + Month Navigator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex rounded-xl bg-neutral-100 dark:bg-white/5 p-1">
              {(["loja", "hospitalaria", "mensalidades"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCaixa(c)}
                  className={cn(
                    "rounded-lg px-3.5 py-1.5 text-[13px] font-medium cursor-pointer transition-all duration-200",
                    caixa === c
                      ? "bg-white text-neutral-900 shadow-sm dark:bg-white/10 dark:text-white"
                      : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400",
                  )}
                >
                  {CAIXA_LABELS[c]}
                </button>
              ))}
            </div>
            <MesNavigator mes={mes} onChange={setMes} />
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Mensalidades status grid */}
            {caixa === "mensalidades" && mensalidadesStatus && (
              <MensalidadesStatus
                status={mensalidadesStatus}
                onRegistrar={handleRegistrarMensalidade}
              />
            )}

            {/* Lancamentos table */}
            <LancamentosTable
              lancamentos={lancamentos ?? []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Resumo */}
            {resumo && <ResumoFinanceiro resumo={resumo.resumo} />}
          </div>
        </div>
      )}

      {/* Form Dialog — always mounted so it's never destroyed by loading state */}
      <LancamentoForm
        caixa={caixa}
        membros={membrosForForm}
        editData={editData}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditData(null);
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
}
