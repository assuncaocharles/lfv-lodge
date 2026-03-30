import { withAuth } from "@/lib/with-auth";
import { getActiveRole } from "@/lib/api-utils";
import { getActiveNotifications, getReadIds } from "@/data/notificacoes";
import { NotificationList } from "@/components/notificacoes/notification-list";

async function NotificacoesPage({
  user,
  orgId,
  member,
}: {
  user: { id: string; name: string };
  orgId: string;
  member: { grau: string; role: string; profileId: string | null; isAdmin: boolean };
}) {
  const role = await getActiveRole();
  const grau = member.grau as "1" | "2" | "3";

  const notifications = await getActiveNotifications(orgId, grau, role ?? "member");
  const readIds = await getReadIds(
    user.id,
    notifications.map((n) => n.id),
  );

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
        notifications={notifications as any}
        readIds={readIds}
        isAdmin={member.isAdmin}
      />
    </div>
  );
}

export default withAuth(NotificacoesPage);
