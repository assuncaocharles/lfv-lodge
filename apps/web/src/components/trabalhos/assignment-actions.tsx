"use client";

import { useState } from "react";
import { Upload } from "iconoir-react";
import { Button } from "@/components/ui/button";
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
import { useMutation } from "@/hooks/use-mutation";

export function AssignmentActions({
  assignmentId,
  status,
  isAdmin,
  isAssignee,
}: {
  assignmentId: string;
  status: string;
  isAdmin: boolean;
  isAssignee: boolean;
}) {
  const { mutate, isPending, error } = useMutation();

  async function updateStatus(newStatus: string) {
    await mutate(() =>
      fetch(`/api/trabalhos/${assignmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {/* Assignee actions */}
        {isAssignee && status === "pendente" && (
          <Button
            variant="outline"
            className="rounded-xl transition-all duration-200"
            onClick={() => updateStatus("em_andamento")}
            disabled={isPending}
          >
            Iniciar Trabalho
          </Button>
        )}
        {isAssignee && (status === "pendente" || status === "em_andamento") && (
          <SubmitDialog assignmentId={assignmentId} />
        )}

        {/* Admin actions */}
        {isAdmin && status === "enviado" && (
          <>
            <Button
              className="rounded-xl transition-all duration-200"
              onClick={() => updateStatus("aprovado")}
              disabled={isPending}
            >
              Aprovar
            </Button>
            <Button
              variant="outline"
              className="rounded-xl transition-all duration-200"
              onClick={() => updateStatus("recusado")}
              disabled={isPending}
            >
              Recusar
            </Button>
            <FeedbackDialog assignmentId={assignmentId} />
          </>
        )}
      </div>
      {error && <p className="text-[13px] text-red-500">{error}</p>}
    </div>
  );
}

function SubmitDialog({ assignmentId }: { assignmentId: string }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [comentario, setComentario] = useState("");

  const { mutate, isPending, error } = useMutation({
    onSuccess: () => {
      setOpen(false);
      setFile(null);
      setComentario("");
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    await mutate(async () => {
      const formData = new FormData();
      formData.append("file", file);
      if (comentario) formData.append("comentario", comentario);

      const res = await fetch(`/api/trabalhos/${assignmentId}/envio`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Erro ao enviar arquivo");
      }

      // Update status to "enviado"
      const statusRes = await fetch(`/api/trabalhos/${assignmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "enviado" }),
      });

      return statusRes;
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && setOpen(v)}>
      <DialogTrigger asChild>
        <Button className="rounded-xl transition-all duration-200">
          <Upload className="size-4 mr-1" /> Enviar Trabalho
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-neutral-900 tracking-tight">
            Enviar Trabalho
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-700">Arquivo</Label>
            <Input
              type="file"
              className="rounded-xl"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-700">Comentário (opcional)</Label>
            <Textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={2}
              disabled={isPending}
              className="rounded-xl"
            />
          </div>
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <Button
            type="submit"
            disabled={isPending || !file}
            className="w-full rounded-xl transition-all duration-200"
          >
            {isPending ? "Enviando..." : "Enviar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FeedbackDialog({ assignmentId }: { assignmentId: string }) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const { mutate, isPending, error } = useMutation({
    onSuccess: () => {
      setOpen(false);
      setFeedback("");
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && setOpen(v)}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl transition-all duration-200">
          Adicionar Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-neutral-900 tracking-tight">
            Feedback
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            placeholder="Escreva seu feedback..."
            disabled={isPending}
            className="rounded-xl"
          />
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <Button
            onClick={async () => {
              await mutate(() =>
                fetch(`/api/trabalhos/${assignmentId}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ feedbackAdmin: feedback }),
                })
              );
            }}
            disabled={isPending || !feedback}
            className="w-full rounded-xl transition-all duration-200"
          >
            {isPending ? "Salvando..." : "Salvar Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
