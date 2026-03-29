import Link from "next/link";
import {
  Group,
  Folder,
  Calendar,
  Bell,
  TaskList,
  Building,
  ArrowRight,
  Clock,
  MapPin,
} from "iconoir-react";
import { withAuth } from "@/lib/with-auth";
import { getOrgMembers } from "@/data/membros";
import { getUpcomingEvents } from "@/data/eventos";
import { getUnreadCount } from "@/data/notificacoes";
import { getAssignments } from "@/data/trabalhos";

const quickLinks = [
  {
    title: "Documentos",
    desc: "Acesse documentos e atas",
    href: "/documentos",
    icon: Folder,
    gradient: "from-amber-500/10 to-amber-500/5",
    iconBg: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Calendário",
    desc: "Próximos eventos e sessões",
    href: "/calendario",
    icon: Calendar,
    gradient: "from-teal-500/10 to-teal-500/5",
    iconBg: "bg-teal-500/10 text-teal-600",
  },
  {
    title: "Loja",
    desc: "Informações da loja",
    href: "/loja",
    icon: Building,
    gradient: "from-violet-500/10 to-violet-500/5",
    iconBg: "bg-violet-500/10 text-violet-600",
  },
];

async function DashboardPage({
  user,
  orgId,
  member,
}: {
  user: { id: string; name: string };
  orgId: string;
  member: { grau: string; role: string };
}) {
  const firstName = user.name?.split(" ")[0];

  const [members, events, unreadCount, assignments] = await Promise.all([
    getOrgMembers(orgId),
    getUpcomingEvents(orgId, member.grau as "1" | "2" | "3", 4),
    getUnreadCount(orgId, user.id, member.grau, member.role),
    getAssignments(orgId, user.id),
  ]);

  const activeMembers = members.filter((m) => m.ativo);
  const pendingAssignments = assignments.filter(
    (a) => a.status === "pendente" || a.status === "em_andamento"
  );

  const stats = [
    {
      label: "Membros Ativos",
      value: activeMembers.length,
      icon: Group,
      href: "/membros",
      accent: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Próximos Eventos",
      value: events.length,
      icon: Calendar,
      href: "/calendario",
      accent: "bg-teal-500/10 text-teal-600",
    },
    {
      label: "Notificações",
      value: unreadCount,
      suffix: unreadCount === 1 ? "não lida" : "não lidas",
      icon: Bell,
      href: "/notificacoes",
      accent: "bg-gold-500/10 text-gold-600",
    },
    {
      label: "Trabalhos",
      value: pendingAssignments.length,
      suffix: pendingAssignments.length === 1 ? "pendente" : "pendentes",
      icon: TaskList,
      href: "/trabalhos",
      accent: "bg-violet-500/10 text-violet-600",
    },
  ];

  return (
    <div className="max-w-6xl space-y-8">
      {/* Greeting */}
      <div className="animate-fade-up">
        <p className="text-[13px] font-medium text-neutral-400 mb-1">
          Bem-vindo de volta
        </p>
        <h1 className="font-display text-3xl font-bold text-[var(--app-card-fg)] tracking-tight">
          {firstName}
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, suffix, icon: Icon, href, accent }, i) => (
          <Link
            key={href}
            href={href}
            className={`group relative bg-[var(--app-card)] rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 animate-fade-up stagger-${i + 1}`}
            style={{ animationFillMode: "both" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-11 h-11 rounded-xl ${accent} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}
              >
                <Icon className="size-5" strokeWidth={1.8} />
              </div>
              <ArrowRight className="size-4 text-neutral-300 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0" />
            </div>
            <p className="font-display text-2xl font-bold text-[var(--app-card-fg)] tracking-tight">
              {value}
            </p>
            <p className="text-[13px] text-neutral-500 mt-0.5">
              {suffix ? `${label} · ${suffix}` : label}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Upcoming events */}
        <div
          className="lg:col-span-3 bg-white rounded-2xl shadow-card animate-fade-up stagger-5"
          style={{ animationFillMode: "both" }}
        >
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <h2 className="font-display text-[15px] font-semibold text-neutral-900">
              Próximos Eventos
            </h2>
            <Link
              href="/calendario"
              className="text-[12px] font-medium text-gold-600 hover:text-gold-700 transition-colors flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="px-6 pb-6">
              <p className="text-[13px] text-neutral-400">
                Nenhum evento programado
              </p>
            </div>
          ) : (
            <div className="px-3 pb-3">
              {events.map((event, i) => {
                const date = new Date(event.dataInicio);
                const day = date.getDate().toString().padStart(2, "0");
                const month = date
                  .toLocaleDateString("pt-BR", { month: "short" })
                  .replace(".", "");
                const time = event.diaInteiro
                  ? "Dia inteiro"
                  : date.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-neutral-50 transition-colors"
                  >
                    {/* Date badge */}
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[15px] font-bold text-neutral-900 leading-none">
                        {day}
                      </span>
                      <span className="text-[10px] font-medium text-neutral-400 uppercase mt-0.5">
                        {month}
                      </span>
                    </div>

                    {/* Event info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-neutral-900 truncate">
                        {event.titulo}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                          <Clock className="size-3" />
                          {time}
                        </span>
                        {event.local && (
                          <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                            <MapPin className="size-3" />
                            <span className="truncate max-w-[140px]">
                              {event.local}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="lg:col-span-2 space-y-4">
          <h2
            className="font-display text-[15px] font-semibold text-neutral-900 animate-fade-up stagger-5"
            style={{ animationFillMode: "both" }}
          >
            Acesso Rápido
          </h2>
          {quickLinks.map(
            ({ title, desc, href, icon: Icon, gradient, iconBg }, i) => (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-4 bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 animate-fade-up stagger-${i + 6}`}
                style={{ animationFillMode: "both" }}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}
                >
                  <Icon className="size-5" strokeWidth={1.7} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-neutral-900">
                    {title}
                  </p>
                  <p className="text-[12px] text-neutral-400 mt-0.5">{desc}</p>
                </div>
                <ArrowRight className="size-4 text-neutral-300 group-hover:text-neutral-500 transition-colors shrink-0" />
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(DashboardPage);
