import { headers } from "next/headers";
import { withAuth } from "@/lib/with-auth";
import { isLuz } from "@/lib/api-utils";
import { getMemberByUserId } from "@/data/membros";
import { getEventsByRange } from "@/data/eventos";
import { createFeedToken } from "@/lib/feed-token";
import { CalendarView } from "@/components/calendario/calendar-view";

async function CalendarioPage({
  user,
  orgId,
  member,
  searchParams,
}: {
  user: { id: string; name: string };
  orgId: string;
  member: { grau: string; role: string; profileId: string | null };
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const now = new Date();
  const year = mes ? parseInt(mes.split("-")[0]) : now.getFullYear();
  const month = mes ? parseInt(mes.split("-")[1]) : now.getMonth() + 1;

  const admin = await isLuz();
  const grau = member.grau as "1" | "2" | "3";

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const events = await getEventsByRange(orgId, start, end, grau);

  // Build the public feed URL for Google Calendar subscription
  const feedToken = createFeedToken(user.id, orgId, grau);
  const reqHeaders = await headers();
  const host = reqHeaders.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const feedUrl = `${protocol}://${host}/api/eventos/feed/${feedToken}`;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 tracking-tight">
          Calendário
        </h1>
        <p className="text-[13px] text-neutral-500 mt-1">
          Eventos e sessões da loja
        </p>
      </div>
      <CalendarView
        events={events as any}
        year={year}
        month={month}
        isAdmin={admin}
        feedUrl={feedUrl}
      />
    </div>
  );
}

export default withAuth(CalendarioPage);
