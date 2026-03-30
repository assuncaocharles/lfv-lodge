"use client";

import { useState } from "react";
import { EditPencil } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GRAU_LABELS, CARGO_LABELS } from "@/lib/constants";
import { useMutation } from "@/hooks/use-mutation";

interface MemberData {
  id: string;
  grau: string;
  cargo: string | null;
  cim: string | null;
  telefone: string | null;
  dataNascimento: string | null;
  dataIniciacao: string | null;
  dataElevacao: string | null;
  dataExaltacao: string | null;
}

function toInputDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toISOString().split("T")[0];
}

export function EditMemberDialog({ member }: { member: MemberData }) {
  const [open, setOpen] = useState(false);

  const { mutate, isPending, error } = useMutation({
    onSuccess: () => setOpen(false),
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const cargo = form.get("cargo") as string;

    await mutate(() =>
      fetch(`/api/membros/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grau: form.get("grau"),
          cargo: cargo === "none" ? null : cargo,
          cim: form.get("cim") || null,
          telefone: form.get("telefone") || null,
          dataNascimento: form.get("dataNascimento") || null,
          dataIniciacao: form.get("dataIniciacao") || null,
          dataElevacao: form.get("dataElevacao") || null,
          dataExaltacao: form.get("dataExaltacao") || null,
        }),
      })
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && setOpen(v)}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl text-[13px] gap-1.5 transition-all duration-200"
        >
          <EditPencil className="size-4" strokeWidth={1.7} />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold tracking-tight">
            Editar Membro
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Grau */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-neutral-600">
              Grau
            </Label>
            <Select name="grau" defaultValue={member.grau} disabled={isPending}>
              <SelectTrigger className="rounded-xl h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GRAU_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cargo */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-neutral-600">
              Cargo
            </Label>
            <Select
              name="cargo"
              defaultValue={member.cargo ?? "none"}
              disabled={isPending}
            >
              <SelectTrigger className="rounded-xl h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {Object.entries(CARGO_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* CIM */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-neutral-600">
              CIM
            </Label>
            <Input
              name="cim"
              defaultValue={member.cim ?? ""}
              disabled={isPending}
              placeholder="Número do CIM"
              className="rounded-xl h-10 bg-neutral-50 border-neutral-200 dark:bg-white/5 dark:border-white/10"
            />
          </div>

          {/* Telefone */}
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-neutral-600">
              Telefone
            </Label>
            <Input
              name="telefone"
              defaultValue={member.telefone ?? ""}
              disabled={isPending}
              placeholder="(00) 00000-0000"
              className="rounded-xl h-10 bg-neutral-50 border-neutral-200 dark:bg-white/5 dark:border-white/10"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-neutral-600">
                Nascimento
              </Label>
              <Input
                name="dataNascimento"
                type="date"
                defaultValue={toInputDate(member.dataNascimento)}
                disabled={isPending}
                className="rounded-xl h-10 bg-neutral-50 border-neutral-200 dark:bg-white/5 dark:border-white/10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-neutral-600">
                Iniciação
              </Label>
              <Input
                name="dataIniciacao"
                type="date"
                defaultValue={toInputDate(member.dataIniciacao)}
                disabled={isPending}
                className="rounded-xl h-10 bg-neutral-50 border-neutral-200 dark:bg-white/5 dark:border-white/10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-neutral-600">
                Elevação
              </Label>
              <Input
                name="dataElevacao"
                type="date"
                defaultValue={toInputDate(member.dataElevacao)}
                disabled={isPending}
                className="rounded-xl h-10 bg-neutral-50 border-neutral-200 dark:bg-white/5 dark:border-white/10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-neutral-600">
                Exaltação
              </Label>
              <Input
                name="dataExaltacao"
                type="date"
                defaultValue={toInputDate(member.dataExaltacao)}
                disabled={isPending}
                className="rounded-xl h-10 bg-neutral-50 border-neutral-200 dark:bg-white/5 dark:border-white/10"
              />
            </div>
          </div>

          {error && <p className="text-[13px] text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl h-10"
          >
            {isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
