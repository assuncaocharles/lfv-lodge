"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function updateStatus(newStatus: string) {
    setIsPending(true);
    try {
      await fetch(`/api/trabalhos/${assignmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  async function addFeedback(feedback: string) {
    setIsPending(true);
    try {
      await fetch(`/api/trabalhos/${assignmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackAdmin: feedback }),
      });
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
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
          <FeedbackDialog onSubmit={addFeedback} isPending={isPending} />
        </>
      )}
    </div>
  );
}

function SubmitDialog({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [comentario, setComentario] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);

    try {
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
      await fetch(`/api/trabalhos/${assignmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "enviado" }),
      });

      setOpen(false);
      router.refresh();
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-700">Comentário (opcional)</Label>
            <Textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={2}
              className="rounded-xl"
            />
          </div>
          <Button
            type="submit"
            disabled={isUploading || !file}
            className="w-full rounded-xl transition-all duration-200"
          >
            {isUploading ? "Enviando..." : "Enviar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FeedbackDialog({
  onSubmit,
  isPending,
}: {
  onSubmit: (feedback: string) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            className="rounded-xl"
          />
          <Button
            onClick={() => {
              onSubmit(feedback);
              setOpen(false);
            }}
            disabled={isPending || !feedback}
            className="w-full rounded-xl transition-all duration-200"
          >
            Salvar Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
