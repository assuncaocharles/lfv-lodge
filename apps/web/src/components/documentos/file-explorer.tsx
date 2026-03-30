"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Folder, Page, Upload, Plus, Trash } from "iconoir-react";
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
import { DegreeBadge } from "@/components/membros/degree-badge";
import { GRAU_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Doc {
  id: string;
  tipo: string;
  nome: string;
  tamanho: number | null;
  grauMinimo: string;
  criadoPorNome: string;
  createdAt: string;
}

interface Breadcrumb {
  id: string;
  nome: string;
}

export function FileExplorer({
  items,
  breadcrumbs,
  currentFolderId,
  currentFolderGrau,
  isAdmin,
}: {
  items: Doc[];
  breadcrumbs: Breadcrumb[];
  currentFolderId: string | null;
  currentFolderGrau: string | null;
  isAdmin: boolean;
}) {
  const router = useRouter();

  function navigateToFolder(folderId: string | null) {
    if (folderId) {
      router.push(`/documentos?pasta=${folderId}`);
    } else {
      router.push("/documentos");
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/documentos/${id}`, { method: "DELETE" });
    await new Promise((r) => setTimeout(r, 500));
    router.refresh();
  }

  const folders = items.filter((i) => i.tipo === "folder");
  const files = items.filter((i) => i.tipo !== "folder");

  return (
    <div className="space-y-5">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[13px] flex-wrap">
        <button
          onClick={() => navigateToFolder(null)}
          className="text-neutral-500 hover:text-neutral-900 transition-all duration-200 font-medium"
        >
          Raiz
        </button>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.id} className="flex items-center gap-1.5">
            <span className="text-neutral-400">/</span>
            <button
              onClick={() => navigateToFolder(crumb.id)}
              className="text-neutral-500 hover:text-neutral-900 transition-all duration-200 font-medium"
            >
              {crumb.nome}
            </button>
          </span>
        ))}
      </div>

      {/* Actions */}
      {isAdmin && (
        <div className="flex gap-2">
          <NewFolderDialog currentFolderId={currentFolderId} />
          <UploadDialog
            currentFolderId={currentFolderId}
            currentFolderGrau={currentFolderGrau}
          />
        </div>
      )}

      {/* Folders */}
      {folders.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder, i) => (
            <div
              key={folder.id}
              className={cn(
                "flex items-center gap-3 rounded-xl bg-white p-4",
                "shadow-card transition-all duration-200",
                "hover:bg-neutral-50 hover:shadow-card-hover hover:-translate-y-px",
                `animate-fade-up stagger-${Math.min(i + 1, 6)}`,
              )}
              style={{ animationFillMode: "both" }}
            >
              <button
                onClick={() => navigateToFolder(folder.id)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-gold-50 shrink-0">
                  <Folder className="size-5 text-gold-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-neutral-900 truncate">
                    {folder.nome}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <DegreeBadge grau={folder.grauMinimo} />
                  </div>
                </div>
              </button>
              {isAdmin && (
                <DeleteButton
                  onDelete={() => handleDelete(folder.id)}
                  itemName={folder.nome}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Files */}
      {files.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file, i) => (
            <div
              key={file.id}
              className={cn(
                "flex items-center gap-3 rounded-xl bg-white p-4",
                "shadow-card transition-all duration-200",
                "hover:bg-neutral-50 hover:shadow-card-hover",
                `animate-fade-up stagger-${Math.min(i + 1, 6)}`,
              )}
              style={{ animationFillMode: "both" }}
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-100 shrink-0">
                <Page className="size-5 text-neutral-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-neutral-900 truncate">
                  {file.nome}
                </p>
                <p className="text-[13px] text-neutral-500 mt-0.5">
                  {file.tamanho ? formatBytes(file.tamanho) : ""} ·{" "}
                  {file.criadoPorNome}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`/api/documentos/${file.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-medium text-neutral-600 hover:text-neutral-900 transition-all duration-200"
                >
                  Abrir
                </a>
                {isAdmin && (
                  <DeleteButton
                    onDelete={() => handleDelete(file.id)}
                    itemName={file.nome}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div className="rounded-2xl bg-white shadow-card p-12 text-center text-[13px] text-neutral-500">
          Pasta vazia
        </div>
      )}
    </div>
  );
}

function DeleteButton({
  onDelete,
  itemName,
}: {
  onDelete: () => void;
  itemName: string;
}) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    await onDelete();
    setOpen(false);
    setDeleting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200">
          <Trash className="size-4" strokeWidth={1.7} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold tracking-tight">
            Excluir
          </DialogTitle>
        </DialogHeader>
        <p className="text-[13px] text-neutral-500">
          Tem certeza que deseja excluir <strong>{itemName}</strong>? Esta ação
          não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-xl text-[13px]"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleting}
            className="rounded-xl text-[13px]"
          >
            {deleting ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function NewFolderDialog({
  currentFolderId,
}: {
  currentFolderId: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [grauMinimo, setGrauMinimo] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch("/api/documentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, pastaPaiId: currentFolderId, grauMinimo }),
      });
      setOpen(false);
      setNome("");
      await new Promise((r) => setTimeout(r, 500));
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl transition-all duration-200"
        >
          <Plus className="size-4 mr-1.5" /> Nova Pasta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg tracking-tight">
            Nova Pasta
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-500">Nome</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="rounded-xl h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-500">Grau Mínimo</Label>
            <Select value={grauMinimo} onValueChange={setGrauMinimo}>
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
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl h-10 transition-all duration-200"
          >
            {isSubmitting ? "Criando..." : "Criar Pasta"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UploadDialog({
  currentFolderId,
  currentFolderGrau,
}: {
  currentFolderId: string | null;
  currentFolderGrau: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [grauMinimo, setGrauMinimo] = useState("1");
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const inheritedGrau = currentFolderGrau;

  function resetState() {
    setFile(null);
    setStatus("idle");
    setErrorMsg("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setStatus("uploading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("nome", file.name);
      formData.append("grauMinimo", inheritedGrau ?? grauMinimo);
      if (currentFolderId) {
        formData.append("pastaPaiId", currentFolderId);
      }

      const res = await fetch("/api/documentos/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Erro ao enviar arquivo");
      }

      setStatus("success");

      // Brief success feedback, then close and refresh
      setTimeout(() => {
        setOpen(false);
        resetState();
        router.refresh();
      }, 800);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Erro ao enviar arquivo"
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (status === "uploading") return; // prevent close during upload
        setOpen(v);
        if (!v) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-xl transition-all duration-200">
          <Upload className="size-4 mr-1.5" /> Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg tracking-tight">
            Upload de Arquivo
          </DialogTitle>
        </DialogHeader>

        {status === "success" ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-3">
              <svg
                className="size-6 text-teal-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-[14px] font-semibold text-neutral-900">
              Arquivo enviado!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[13px] text-neutral-500">Arquivo</Label>
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                required
                disabled={status === "uploading"}
                className="rounded-xl"
              />
            </div>
            {inheritedGrau ? (
              <p className="text-[12px] text-neutral-400">
                Grau mínimo herdado da pasta:{" "}
                <span className="font-medium text-neutral-600">
                  {GRAU_LABELS[inheritedGrau] ?? `Grau ${inheritedGrau}`}
                </span>
              </p>
            ) : (
              <div className="space-y-2">
                <Label className="text-[13px] text-neutral-500">
                  Grau Mínimo
                </Label>
                <Select
                  value={grauMinimo}
                  onValueChange={setGrauMinimo}
                  disabled={status === "uploading"}
                >
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
            )}

            {status === "error" && (
              <p className="text-[13px] text-red-500 font-medium">
                {errorMsg}
              </p>
            )}

            <Button
              type="submit"
              disabled={status === "uploading" || !file}
              className="w-full rounded-xl h-10 transition-all duration-200"
            >
              {status === "uploading" ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="size-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Enviando...
                </span>
              ) : status === "error" ? (
                "Tentar Novamente"
              ) : (
                "Enviar"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
