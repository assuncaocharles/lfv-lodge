"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "iconoir-react";
import { CurrencyInput } from "./currency-input";
import {
  CATEGORIAS_POR_CAIXA,
  CATEGORIA_LABELS,
  TIPO_LABELS,
  type Caixa,
  type CategoriaLancamento,
  type TipoLancamento,
} from "@/lib/tesouraria-constants";
import type { Lancamento } from "./lancamentos-table";

interface LancamentoFormProps {
  caixa: Caixa;
  membros?: { id: string; nome: string }[];
  editData?: Lancamento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    caixa: Caixa;
    data: string;
    valor: number;
    tipo: TipoLancamento;
    categoria: CategoriaLancamento;
    descricao?: string;
    membroId?: string;
    mesReferencia?: string;
  }) => Promise<void>;
}

function toDateInputValue(dateStr: string): string {
  const d = new Date(dateStr);
  const sp = new Date(
    d.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
  );
  const y = sp.getFullYear();
  const m = String(sp.getMonth() + 1).padStart(2, "0");
  const day = String(sp.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function LancamentoForm({
  caixa,
  membros,
  editData,
  open,
  onOpenChange,
  onSubmit,
}: LancamentoFormProps) {
  const [data, setData] = useState("");
  const [valor, setValor] = useState(0);
  const [tipo, setTipo] = useState<TipoLancamento>("credito");
  const [categoria, setCategoria] = useState<CategoriaLancamento | "">("");
  const [descricao, setDescricao] = useState("");
  const [membroId, setMembroId] = useState("");
  const [mesReferencia, setMesReferencia] = useState("");
  const [isPending, setIsPending] = useState(false);

  const categorias = CATEGORIAS_POR_CAIXA[caixa];
  const isMensalidades = caixa === "mensalidades";

  useEffect(() => {
    if (editData) {
      setData(toDateInputValue(editData.data));
      setValor(editData.valor);
      setTipo(editData.tipo as TipoLancamento);
      setCategoria(editData.categoria as CategoriaLancamento);
      setDescricao(editData.descricao || "");
      setMembroId(editData.membroId || "");
      setMesReferencia(editData.mesReferencia || "");
    } else {
      setData(new Date().toISOString().split("T")[0]);
      setValor(0);
      setTipo("credito");
      setCategoria("");
      setDescricao("");
      setMembroId("");
      setMesReferencia("");
    }
  }, [editData, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoria || !valor) return;

    setIsPending(true);
    try {
      await onSubmit({
        caixa,
        data: `${data}T12:00`,
        valor,
        tipo,
        categoria: categoria as CategoriaLancamento,
        descricao: descricao || undefined,
        membroId: membroId || undefined,
        mesReferencia: mesReferencia || undefined,
      });
      onOpenChange(false);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editData ? "Editar Lançamento" : "Novo Lançamento"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="data" className="text-[12px]">
                Data
              </Label>
              <Input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="valor" className="text-[12px]">
                Valor
              </Label>
              <CurrencyInput value={valor} onChange={setValor} id="valor" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[12px]">Tipo</Label>
              <Select
                value={tipo}
                onValueChange={(v) => setTipo(v as TipoLancamento)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["credito", "debito"] as const).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Categoria</Label>
              <Select
                value={categoria}
                onValueChange={(v) => setCategoria(v as CategoriaLancamento)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORIA_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isMensalidades && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px]">Membro</Label>
                <Select value={membroId} onValueChange={setMembroId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {membros?.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mesRef" className="text-[12px]">
                  Mês Referência
                </Label>
                <Input
                  id="mesRef"
                  type="month"
                  value={mesReferencia}
                  onChange={(e) => setMesReferencia(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="descricao" className="text-[12px]">
              Descrição
            </Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
              placeholder="Descrição do lançamento..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !categoria || !valor}>
              {isPending
                ? "Salvando..."
                : editData
                  ? "Salvar"
                  : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LancamentoFormTrigger({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button onClick={onClick} className="gap-2">
      <Plus className="size-4" />
      Novo Lançamento
    </Button>
  );
}
