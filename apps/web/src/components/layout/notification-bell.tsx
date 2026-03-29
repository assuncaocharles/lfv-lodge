"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell } from "iconoir-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Notification {
  id: string;
  titulo: string;
  corpo: string;
  createdAt: string;
  criadoPorNome: string;
}

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notificacoes?contagem=true");
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  async function fetchNotifications() {
    if (loaded) return;
    try {
      const res = await fetch("/api/notificacoes");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.slice(0, 5));
        setLoaded(true);
      }
    } catch {
      // ignore
    }
  }

  async function markAllRead() {
    if (notifications.length === 0) return;
    try {
      await fetch("/api/notificacoes/lidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: notifications.map((n) => n.id) }),
      });
      setCount(0);
    } catch {
      // ignore
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) fetchNotifications();
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl size-9 relative">
          <Bell className="size-[18px]" strokeWidth={1.7} />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 rounded-xl shadow-elevated border-[var(--app-border)]"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--app-border)]">
          <h3 className="font-display text-[14px] font-semibold">
            Notificações
          </h3>
          {count > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              Marcar como lidas
            </button>
          )}
        </div>

        <div className="max-h-[320px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-neutral-400">
              Nenhuma notificação
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="px-4 py-3 hover:bg-[var(--app-muted)] transition-colors border-b last:border-b-0 border-[var(--app-border)]"
              >
                <p className="text-[13px] font-semibold leading-tight">
                  {n.titulo}
                </p>
                <p className="text-[12px] text-neutral-500 mt-0.5 line-clamp-2">
                  {n.corpo}
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  {new Date(n.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-[var(--app-border)] px-4 py-2.5">
          <Link
            href="/notificacoes"
            className="text-[12px] font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
            onClick={() => setOpen(false)}
          >
            Ver todas as notificações
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
