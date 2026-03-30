"use client";

import { useSearchParams } from "next/navigation";
import { useMember } from "@/hooks/use-member";
import { useFetch } from "@/hooks/use-fetch";
import { CalendarView } from "@/components/calendario/calendar-view";

export default function CalendarioPage() {
  const { member } = useMember();
  const searchParams = useSearchParams();

  const mes = searchParams.get("mes");
  const now = new Date();
  const year = mes ? parseInt(mes.split("-")[0]) : now.getFullYear();
  const month = mes ? parseInt(mes.split("-")[1]) : now.getMonth() + 1;

  const mesParam = `${year}-${String(month).padStart(2, "0")}`;
  const { data: events, isLoading } = useFetch<any[]>(
    `/api/eventos?mes=${mesParam}`,
  );
  const { data: feedData } = useFetch<{ feedUrl: string }>("/api/eventos/feed-url");

  if (isLoading || !events) {
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
        <div className="flex items-center justify-center py-12 text-neutral-500 text-sm">
          Carregando eventos...
        </div>
      </div>
    );
  }

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
        events={events}
        year={year}
        month={month}
        isAdmin={member.isAdmin}
        feedUrl={feedData?.feedUrl ?? ""}
      />
    </div>
  );
}
