"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import { cn, getErrorMessage } from "@/lib/utils";

interface Notification {
  id: string;
  titulo: string;
  corpo: string;
  publicoAlvo: string;
  expiraEm: string | null;
  createdAt: string;
  criadoPorNome: string;
}

const TARGET_LABELS: Record<string, string> = {
  todos: "Todos",
  grau_1: "Grau 1+",
  grau_2: "Grau 2+",
  grau_3: "Grau 3",
  luz: "Administradores",
};

export function NotificationList({
  notifications,
  readIds,
  isAdmin,
}: {
  notifications: Notification[];
  readIds: Set<string>;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [localReadIds, setLocalReadIds] = useState(readIds);

  async function markAsRead(ids: string[]) {
    // Optimistic update
    setLocalReadIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      return next;
    });

    // Sync in background
    fetch("/api/notificacoes/lidas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    }).then(() => router.refresh());
  }

  function handleNotificationCreated(notification: Notification) {
    setLocalNotifications((prev) => [notification, ...prev]);
  }

  const unreadIds = localNotifications
    .filter((n) => !localReadIds.has(n.id))
    .map((n) => n.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {unreadIds.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl transition-all duration-200"
            onClick={() => markAsRead(unreadIds)}
          >
            Marcar todas como lidas ({unreadIds.length})
          </Button>
        )}
        <div className="flex-1" />
        {isAdmin && (
          <CreateNotificationDialog
            onCreated={handleNotificationCreated}
          />
        )}
      </div>

      {localNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center text-[13px] text-neutral-500">
          Nenhuma notificação
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card divide-y divide-neutral-100">
          {localNotifications.map((n) => {
            const isRead = localReadIds.has(n.id);
            return (
              <div
                key={n.id}
                onClick={() => !isRead && markAsRead([n.id])}
                className={cn(
                  "p-4 first:rounded-t-2xl last:rounded-b-2xl transition-all duration-200 cursor-pointer hover:bg-neutral-50",
                  !isRead && "border-l-2 border-gold-400 bg-gold-50/30",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {!isRead && (
                        <span className="size-2 rounded-full bg-gold-500 shrink-0" />
                      )}
                      <h3 className="font-display text-[15px] font-semibold text-neutral-900 tracking-tight truncate">
                        {n.titulo}
                      </h3>
                    </div>
                    <p className="text-[13px] text-neutral-500 mt-1 line-clamp-3">
                      {n.corpo}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-neutral-400">
                      <span>{n.criadoPorNome}</span>
                      <span>·</span>
                      <span>{new Date(n.createdAt).toLocaleDateString("pt-BR")}</span>
                      <Badge
                        variant="outline"
                        className="rounded-lg px-2 py-0.5 text-[10px] font-medium text-neutral-500 border-neutral-200"
                      >
                        {TARGET_LABELS[n.publicoAlvo] ?? n.publicoAlvo}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CreateNotificationDialog({
  onCreated,
}: {
  onCreated: (notification: Notification) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/notificacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.get("titulo"),
          corpo: form.get("corpo"),
          publicoAlvo: form.get("publicoAlvo"),
          expiraEm: form.get("expiraEm") || undefined,
          enviarEmail: form.get("enviarEmail") === "on",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Ocorreu um erro");
      }

      const created = await res.json();
      onCreated(created);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Ocorreu um erro inesperado"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && setOpen(v)}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-xl transition-all duration-200">
          <Plus className="size-4 mr-1" /> Nova
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-neutral-900 tracking-tight">
            Nova Notificação
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-700">Título</Label>
            <Input name="titulo" required disabled={isPending} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-700">Mensagem</Label>
            <Textarea name="corpo" rows={3} required disabled={isPending} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-700">Público Alvo</Label>
            <Select name="publicoAlvo" defaultValue="todos" disabled={isPending}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {Object.entries(TARGET_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-700">Expira em (opcional)</Label>
            <Input name="expiraEm" type="datetime-local" disabled={isPending} className="rounded-xl" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox name="enviarEmail" id="enviarEmail" disabled={isPending} />
            <Label htmlFor="enviarEmail" className="text-[13px] text-neutral-600">
              Enviar por email
            </Label>
          </div>
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl transition-all duration-200"
          >
            {isPending ? "Criando..." : "Criar Notificação"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
