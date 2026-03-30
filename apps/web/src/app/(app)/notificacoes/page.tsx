"use client";

import { useMember } from "@/hooks/use-member";
import { useFetch } from "@/hooks/use-fetch";
import { NotificationList } from "@/components/notificacoes/notification-list";

export default function NotificacoesPage() {
  const { member } = useMember();

  const { data: notifications, isLoading } = useFetch<any[]>(
    `/api/notificacoes`,
  );

  if (isLoading || !notifications) {
    return (
      <div className="animate-fade-up space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 tracking-tight">
            Notificações
          </h1>
          <p className="text-[13px] text-neutral-500 mt-1">
            Avisos e comunicados da loja
          </p>
        </div>
        <div className="flex items-center justify-center py-12 text-neutral-500 text-sm">
          Carregando notificações...
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 tracking-tight">
          Notificações
        </h1>
        <p className="text-[13px] text-neutral-500 mt-1">
          Avisos e comunicados da loja
        </p>
      </div>
      <NotificationList
        notifications={notifications}
        readIds={new Set<string>()}
        isAdmin={member.isAdmin}
      />
    </div>
  );
}
