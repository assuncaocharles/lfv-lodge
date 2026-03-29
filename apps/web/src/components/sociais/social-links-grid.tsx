"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Instagram,
  Facebook,
  Youtube,
  Globe,
  Link as LinkIcon,
  Plus,
  Trash,
} from "iconoir-react";
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

interface SocialLink {
  id: string;
  plataforma: string;
  titulo: string;
  url: string;
}

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  website: Globe,
};

const PLATFORM_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "telegram", label: "Telegram" },
  { value: "website", label: "Website" },
  { value: "outro", label: "Outro" },
];

export function SocialLinksGrid({
  links,
  isAdmin,
}: {
  links: SocialLink[];
  isAdmin: boolean;
}) {
  const router = useRouter();

  async function handleDelete(id: string) {
    await fetch(`/api/sociais/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <AddLinkDialog />
        </div>
      )}

      {links.length === 0 ? (
        <div className="rounded-2xl bg-white shadow-card p-8 text-center text-[13px] text-neutral-500">
          Nenhum link cadastrado
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => {
            const Icon = PLATFORM_ICONS[link.plataforma] ?? LinkIcon;
            return (
              <div
                key={link.id}
                className="relative bg-white rounded-2xl shadow-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gold-50">
                    <Icon className="size-5 text-gold-600 shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-[15px] font-semibold text-neutral-900 tracking-tight truncate">
                      {link.titulo}
                    </p>
                    <p className="text-[13px] text-neutral-500 truncate capitalize">
                      {link.plataforma}
                    </p>
                  </div>
                </a>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                  >
                    <Trash className="size-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddLinkDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);

    try {
      await fetch("/api/sociais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plataforma: form.get("plataforma"),
          titulo: form.get("titulo"),
          url: form.get("url"),
        }),
      });
      setOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-xl transition-all duration-200">
          <Plus className="size-4 mr-1.5" /> Adicionar Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-neutral-900 tracking-tight">
            Novo Link Social
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-neutral-600">
              Plataforma
            </Label>
            <Select name="plataforma" defaultValue="whatsapp">
              <SelectTrigger className="h-11 rounded-xl bg-neutral-50 border-neutral-200 text-[13px] focus:bg-white transition-all duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {PLATFORM_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-neutral-600">
              Título
            </Label>
            <Input
              name="titulo"
              required
              placeholder="Ex: Grupo da Loja"
              className="h-11 rounded-xl bg-neutral-50 border-neutral-200 text-[13px] focus:bg-white transition-all duration-200"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-neutral-600">
              URL
            </Label>
            <Input
              name="url"
              type="url"
              required
              placeholder="https://..."
              className="h-11 rounded-xl bg-neutral-50 border-neutral-200 text-[13px] focus:bg-white transition-all duration-200"
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl transition-all duration-200"
          >
            {isSubmitting ? "Adicionando..." : "Adicionar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
