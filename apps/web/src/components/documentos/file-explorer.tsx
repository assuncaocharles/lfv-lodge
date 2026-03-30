"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Folder, Page, Upload, Plus } from "iconoir-react";
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
  isAdmin,
}: {
  items: Doc[];
  breadcrumbs: Breadcrumb[];
  currentFolderId: string | null;
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
          <UploadDialog currentFolderId={currentFolderId} />
        </div>
      )}

      {/* Folders */}
      {folders.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder, i) => (
            <button
              key={folder.id}
              onClick={() => navigateToFolder(folder.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl bg-white p-4 text-left",
                "shadow-card transition-all duration-200",
                "hover:bg-neutral-50 hover:shadow-card-hover hover:-translate-y-px",
                `animate-fade-up stagger-${Math.min(i + 1, 6)}`,
              )}
              style={{ animationFillMode: "both" }}
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
                  {file.tamanho ? formatBytes(file.tamanho) : ""} · {file.criadoPorNome}
                </p>
                <DegreeBadge grau={file.grauMinimo} />
              </div>
              <a
                href={`/api/documentos/${file.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-medium text-gold-600 hover:text-gold-700 transition-all duration-200"
              >
                Abrir
              </a>
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

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function NewFolderDialog({ currentFolderId }: { currentFolderId: string | null }) {
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
        <Button variant="outline" size="sm" className="rounded-xl transition-all duration-200">
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
                  <SelectItem key={v} value={v}>{l}</SelectItem>
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

function UploadDialog({ currentFolderId }: { currentFolderId: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [grauMinimo, setGrauMinimo] = useState("1");
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);

    try {
      const res = await fetch("/api/documentos/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: file.name,
          mimeType: file.type,
          tamanho: file.size,
          pastaPaiId: currentFolderId,
          grauMinimo,
        }),
      });
      const { uploadUrl } = await res.json();

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      setOpen(false);
      setFile(null);
      await new Promise((r) => setTimeout(r, 500));
      router.refresh();
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-500">Arquivo</Label>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              className="rounded-xl"
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
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            disabled={isUploading || !file}
            className="w-full rounded-xl h-10 transition-all duration-200"
          >
            {isUploading ? "Enviando..." : "Enviar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
