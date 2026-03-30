"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { cn } from "@/lib/utils";

interface Assignment {
  id: string;
  titulo: string;
  descricao: string | null;
  prazo: string | null;
  status: string;
  atribuidoANome: string;
  createdAt: string;
}

interface MemberOption {
  userId: string;
  userName: string;
}

const STATUS_LABELS: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  enviado: "Enviado",
  aprovado: "Aprovado",
  recusado: "Recusado",
};

const STATUS_COLORS: Record<string, string> = {
  pendente: "bg-amber-50 text-amber-600",
  em_andamento: "bg-blue-50 text-blue-600",
  enviado: "bg-violet-50 text-violet-600",
  aprovado: "bg-teal-50 text-teal-600",
  recusado: "bg-red-50 text-red-600",
};

export function AssignmentList({
  assignments,
  members,
  isAdmin,
}: {
  assignments: Assignment[];
  members: MemberOption[];
  isAdmin: boolean;
}) {
  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <CreateAssignmentDialog members={members} />
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center text-[13px] text-neutral-500">
          Nenhum trabalho encontrado
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card divide-y divide-neutral-100">
          {assignments.map((a) => (
            <Link
              key={a.id}
              href={`/trabalhos/${a.id}`}
              className="flex items-center justify-between p-4 first:rounded-t-2xl last:rounded-b-2xl transition-all duration-200 hover:bg-neutral-50"
            >
              <div className="min-w-0">
                <p className="font-display text-[15px] font-semibold text-neutral-900 tracking-tight truncate">
                  {a.titulo}
                </p>
                <p className="text-[13px] text-neutral-500 mt-0.5">
                  Atribuido a {a.atribuidoANome}
                  {a.prazo && (
                    <> · Prazo: {new Date(a.prazo).toLocaleDateString("pt-BR")}</>
                  )}
                </p>
              </div>
              <Badge
                className={cn(
                  "shrink-0 ml-2 rounded-lg px-2.5 py-1 text-[11px] font-semibold border-0",
                  STATUS_COLORS[a.status],
                )}
              >
                {STATUS_LABELS[a.status] ?? a.status}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateAssignmentDialog({ members }: { members: MemberOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);

    try {
      await fetch("/api/trabalhos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.get("titulo"),
          descricao: form.get("descricao") || undefined,
          prazo: form.get("prazo") || undefined,
          atribuidoA: form.get("atribuidoA"),
        }),
      });
      setOpen(false);
      window.location.reload();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-xl transition-all duration-200">
          <Plus className="size-4 mr-1" /> Novo Trabalho
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-neutral-900 tracking-tight">
            Novo Trabalho
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-700">Título</Label>
            <Input name="titulo" required className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-700">Descrição</Label>
            <Textarea name="descricao" rows={3} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-700">Atribuir a</Label>
            <Select name="atribuidoA" required>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecionar membro" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {members.map((m) => (
                  <SelectItem key={m.userId} value={m.userId}>
                    {m.userName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-700">Prazo (opcional)</Label>
            <Input name="prazo" type="date" className="rounded-xl" />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl transition-all duration-200"
          >
            {isSubmitting ? "Criando..." : "Criar Trabalho"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
