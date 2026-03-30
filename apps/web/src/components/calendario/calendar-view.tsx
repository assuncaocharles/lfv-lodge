"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  NavArrowLeft,
  NavArrowRight,
  Plus,
  GoogleCircle,
  EditPencil,
  Trash,
  Clock,
  MapPin,
} from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/datetime-picker";
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
import { ConfirmDialog } from "@/components/confirm-dialog";
import { GRAU_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toSaoPauloDatetimeLocal, formatSaoPauloTime } from "@/lib/timezone";

interface Event {
  id: string;
  titulo: string;
  descricao: string | null;
  local: string | null;
  dataInicio: string;
  dataFim: string | null;
  diaInteiro: boolean;
  grauMinimo: string;
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function formatTime(dateStr: string): string {
  return formatSaoPauloTime(new Date(dateStr));
}

function toDatetimeLocal(dateStr: string): string {
  return toSaoPauloDatetimeLocal(new Date(dateStr));
}

function toGoogleCalendarDate(dateStr: string): string {
  const d = new Date(dateStr);
  const sp = new Date(d.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const y = sp.getFullYear();
  const m = String(sp.getMonth() + 1).padStart(2, "0");
  const day = String(sp.getDate()).padStart(2, "0");
  const h = String(sp.getHours()).padStart(2, "0");
  const min = String(sp.getMinutes()).padStart(2, "0");
  const s = String(sp.getSeconds()).padStart(2, "0");
  return `${y}${m}${day}T${h}${min}${s}`;
}

function getGoogleCalendarUrl(event: Event): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.titulo,
    dates: `${toGoogleCalendarDate(event.dataInicio)}/${event.dataFim ? toGoogleCalendarDate(event.dataFim) : toGoogleCalendarDate(event.dataInicio)}`,
    ctz: "America/Sao_Paulo",
  });
  if (event.descricao) params.set("details", event.descricao);
  if (event.local) params.set("location", event.local);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/* ────────────────────────────────────────────────────────────────── */
/*  Main CalendarView — owns events state for optimistic updates     */
/* ────────────────────────────────────────────────────────────────── */

export function CalendarView({
  events: initialEvents,
  year,
  month,
  isAdmin,
  feedUrl,
}: {
  events: Event[];
  year: number;
  month: number;
  isAdmin: boolean;
  feedUrl: string;
}) {
  const router = useRouter();
  const [view, setView] = useState<"mes" | "lista">("mes");
  const [events, setEvents] = useState<Event[]>(initialEvents);

  function navigate(delta: number) {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    router.push(`/calendario?mes=${y}-${String(m).padStart(2, "0")}`);
  }

  // Optimistic: remove event immediately, sync in background
  const onDelete = useCallback(async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await fetch(`/api/eventos/${id}`, { method: "DELETE" });
    router.refresh();
  }, [router]);

  // Optimistic: add event immediately with temp ID, replace after API responds
  const onCreate = useCallback(async (data: Record<string, string | null>) => {
    const tempEvent: Event = {
      id: `temp-${Date.now()}`,
      titulo: data.titulo ?? "",
      descricao: data.descricao ?? null,
      local: data.local ?? null,
      dataInicio: data.dataInicio ?? new Date().toISOString(),
      dataFim: data.dataFim ?? null,
      diaInteiro: false,
      grauMinimo: data.grauMinimo ?? "1",
    };
    setEvents((prev) => [...prev, tempEvent].sort(
      (a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
    ));

    const res = await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const created = await res.json();
      setEvents((prev) =>
        prev.map((e) => (e.id === tempEvent.id ? { ...tempEvent, ...created } : e))
      );
    }
    router.refresh();
  }, [router]);

  // Optimistic: update event immediately, sync in background
  const onEdit = useCallback(async (id: string, data: Record<string, string | null>) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              titulo: data.titulo ?? e.titulo,
              descricao: data.descricao ?? e.descricao,
              local: data.local ?? e.local,
              dataInicio: data.dataInicio ?? e.dataInicio,
              dataFim: data.dataFim ?? e.dataFim,
              grauMinimo: data.grauMinimo ?? e.grauMinimo,
            }
          : e
      ).sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
    );

    await fetch(`/api/eventos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-5 animate-fade-up" style={{ animationFillMode: "both" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-[var(--app-card)] rounded-2xl shadow-card px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <NavArrowLeft className="size-4 text-neutral-500" />
          </Button>
          <h2 className="font-display text-xl font-semibold min-w-[180px] text-center tracking-tight">
            {MESES[month - 1]} <span className="text-neutral-400">{year}</span>
          </h2>
          <Button variant="ghost" size="icon" onClick={() => navigate(1)} className="rounded-xl">
            <NavArrowRight className="size-4 text-neutral-500" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-neutral-100 dark:bg-white/5 p-1">
            {(["mes", "lista"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-[13px] font-medium cursor-pointer transition-all duration-200",
                  view === v
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-white/10 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400",
                )}
              >
                {v === "mes" ? "Mês" : "Lista"}
              </button>
            ))}
          </div>

          <a
            href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feedUrl.replace(/^https?:\/\//, "webcal://"))}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="rounded-xl text-[13px] gap-1.5">
              <GoogleCircle className="size-4" /> Google Calendar
            </Button>
          </a>

          {isAdmin && <NewEventDialog onCreate={onCreate} />}
        </div>
      </div>

      {view === "mes" ? (
        <MonthView events={events} year={year} month={month} isAdmin={isAdmin} onDelete={onDelete} onEdit={onEdit} />
      ) : (
        <ListView events={events} isAdmin={isAdmin} onDelete={onDelete} onEdit={onEdit} />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  Month View                                                       */
/* ────────────────────────────────────────────────────────────────── */

function MonthView({
  events, year, month, isAdmin, onDelete, onEdit,
}: {
  events: Event[];
  year: number;
  month: number;
  isAdmin: boolean;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, data: Record<string, string | null>) => Promise<void>;
}) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month - 1;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function getEventsForDay(day: number) {
    return events.filter((e) => new Date(e.dataInicio).getDate() === day);
  }

  return (
    <>
      <div className="bg-[var(--app-card)] rounded-2xl shadow-card overflow-hidden">
        <div className="grid grid-cols-7">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="py-3 text-center text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-white/5">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            const isToday = isCurrentMonth && day === today.getDate();
            return (
              <div
                key={i}
                className={cn(
                  "min-h-[100px] border-b border-r border-neutral-100/70 dark:border-white/[0.04] p-1.5 transition-colors",
                  day && "hover:bg-neutral-50/50 dark:hover:bg-white/[0.02]",
                  !day && "bg-neutral-50/30 dark:bg-white/[0.01]",
                )}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-center mb-1">
                      <span className={cn(
                        "inline-flex size-7 items-center justify-center rounded-full text-[13px] font-medium",
                        isToday
                          ? "bg-neutral-900 text-white font-bold dark:bg-white dark:text-neutral-900"
                          : "text-neutral-600 dark:text-neutral-400",
                      )}>
                        {day}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((e) => (
                        <button
                          key={e.id}
                          onClick={() => setSelectedEvent(e)}
                          className="w-full text-left truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium cursor-pointer transition-all bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                        >
                          {!e.diaInteiro && (
                            <span className="text-blue-400 dark:text-blue-300 mr-0.5">
                              {formatTime(e.dataInicio)}
                            </span>
                          )}
                          {e.titulo}
                        </button>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-neutral-400 px-1.5 font-medium">
                          +{dayEvents.length - 2} mais
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedEvent && (
        <EventDetailSheet
          event={selectedEvent}
          isAdmin={isAdmin}
          onClose={() => setSelectedEvent(null)}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  Event Detail Sheet                                               */
/* ────────────────────────────────────────────────────────────────── */

function EventDetailSheet({
  event, isAdmin, onClose, onDelete, onEdit,
}: {
  event: Event;
  isAdmin: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, data: Record<string, string | null>) => Promise<void>;
}) {
  const date = new Date(event.dataInicio);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/30 dark:bg-black/50" onClick={onClose} />
      <div className="relative bg-[var(--app-card)] rounded-t-2xl sm:rounded-2xl shadow-elevated w-full sm:max-w-md p-6 animate-slide-down space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              {date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" })}
            </p>
            <h3 className="font-display text-lg font-bold tracking-tight mt-1">{event.titulo}</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors text-xl leading-none p-1">&times;</button>
        </div>

        <div className="space-y-2">
          {!event.diaInteiro && (
            <div className="flex items-center gap-2 text-[13px] text-neutral-500">
              <Clock className="size-4 text-neutral-400" />
              {formatTime(event.dataInicio)}
              {event.dataFim && ` — ${formatTime(event.dataFim)}`}
            </div>
          )}
          {event.local && (
            <div className="flex items-center gap-2 text-[13px] text-neutral-500">
              <MapPin className="size-4 text-neutral-400" />
              {event.local}
            </div>
          )}
          {event.descricao && <p className="text-[13px] text-neutral-500 mt-2">{event.descricao}</p>}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <a href={getGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="outline" size="sm" className="w-full rounded-xl text-[13px] gap-1.5">
              <GoogleCircle className="size-4" /> Google Calendar
            </Button>
          </a>
          {isAdmin && (
            <>
              <EditEventDialog event={event} onEdit={onEdit} onClose={onClose} />
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" size="icon" className="size-9 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50">
                    <Trash className="size-4" strokeWidth={1.7} />
                  </Button>
                }
                title="Excluir Evento"
                description={`Tem certeza que deseja excluir "${event.titulo}"?`}
                confirmLabel="Excluir"
                confirmingLabel="Excluindo..."
                onConfirm={async () => {
                  onClose();
                  await onDelete(event.id);
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  List View                                                        */
/* ────────────────────────────────────────────────────────────────── */

function ListView({
  events, isAdmin, onDelete, onEdit,
}: {
  events: Event[];
  isAdmin: boolean;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, data: Record<string, string | null>) => Promise<void>;
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl bg-[var(--app-card)] shadow-card p-12 text-center text-[13px] text-neutral-500">
        Nenhum evento neste mês
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event, i) => {
        const date = new Date(event.dataInicio);
        return (
          <div
            key={event.id}
            className={cn(
              "flex gap-4 rounded-xl bg-[var(--app-card)] shadow-card p-4",
              "transition-all duration-200 hover:shadow-card-hover hover:-translate-y-px",
              `animate-fade-up stagger-${Math.min(i + 1, 6)}`,
            )}
            style={{ animationFillMode: "both" }}
          >
            <div className="w-14 shrink-0">
              <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-white/5 flex flex-col items-center justify-center">
                <span className="text-lg font-bold font-display leading-none">
                  {date.toLocaleDateString("pt-BR", { day: "2-digit", timeZone: "America/Sao_Paulo" })}
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mt-0.5">
                  {date.toLocaleDateString("pt-BR", { weekday: "short", timeZone: "America/Sao_Paulo" })}
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-display text-[15px] font-semibold tracking-tight">{event.titulo}</p>
              <div className="flex items-center gap-3 mt-1 text-[12px] text-neutral-500">
                {!event.diaInteiro && (
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {formatTime(event.dataInicio)}
                    {event.dataFim && ` — ${formatTime(event.dataFim)}`}
                  </span>
                )}
                {event.local && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    <span className="truncate max-w-[160px]">{event.local}</span>
                  </span>
                )}
              </div>
              {event.descricao && (
                <p className="text-[12px] text-neutral-400 mt-1 line-clamp-2">{event.descricao}</p>
              )}
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              {isAdmin && (
                <>
                  <EditEventDialog event={event} onEdit={onEdit} />
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" size="icon" className="size-8 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50">
                        <Trash className="size-4" strokeWidth={1.7} />
                      </Button>
                    }
                    title="Excluir Evento"
                    description={`Tem certeza que deseja excluir "${event.titulo}"?`}
                    confirmLabel="Excluir"
                    confirmingLabel="Excluindo..."
                    onConfirm={() => onDelete(event.id)}
                  />
                </>
              )}
              <a href={getGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="size-8 rounded-xl text-neutral-400 hover:text-neutral-600">
                  <GoogleCircle className="size-4" />
                </Button>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  Event Form (shared)                                              */
/* ────────────────────────────────────────────────────────────────── */

function EventForm({
  event,
  isPending,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
}: {
  event?: Event;
  isPending: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: Record<string, string | null>) => void;
}) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onSubmit({
      titulo: form.get("titulo") as string,
      descricao: (form.get("descricao") as string) || null,
      local: (form.get("local") as string) || null,
      dataInicio: form.get("dataInicio") as string,
      dataFim: (form.get("dataFim") as string) || null,
      grauMinimo: form.get("grauMinimo") as string,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-[13px] text-neutral-500 font-medium">Título</Label>
        <Input name="titulo" defaultValue={event?.titulo} required disabled={isPending}
          className="rounded-xl bg-neutral-50 border-neutral-200 h-10 dark:bg-white/5 dark:border-white/10" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-[13px] text-neutral-500 font-medium">Descrição</Label>
        <Textarea name="descricao" defaultValue={event?.descricao ?? ""} rows={2} disabled={isPending}
          className="rounded-xl bg-neutral-50 border-neutral-200 dark:bg-white/5 dark:border-white/10" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-[13px] text-neutral-500 font-medium">Local</Label>
        <Input name="local" defaultValue={event?.local ?? ""} disabled={isPending}
          className="rounded-xl bg-neutral-50 border-neutral-200 h-10 dark:bg-white/5 dark:border-white/10" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[13px] text-neutral-500 font-medium">Início</Label>
          <DateTimePicker name="dataInicio" defaultValue={event ? toDatetimeLocal(event.dataInicio) : undefined} required disabled={isPending} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[13px] text-neutral-500 font-medium">Fim</Label>
          <DateTimePicker name="dataFim" defaultValue={event?.dataFim ? toDatetimeLocal(event.dataFim) : undefined} disabled={isPending} placeholder="Opcional" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-[13px] text-neutral-500 font-medium">Grau Mínimo</Label>
        <Select name="grauMinimo" defaultValue={event?.grauMinimo ?? "1"} disabled={isPending}>
          <SelectTrigger className="rounded-xl bg-neutral-50 border-neutral-200 h-10 dark:bg-white/5 dark:border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(GRAU_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-[13px] text-red-500">{error}</p>}
      <Button type="submit" disabled={isPending} className="w-full rounded-xl h-10">
        {isPending ? submittingLabel : submitLabel}
      </Button>
    </form>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  Edit Event Dialog                                                */
/* ────────────────────────────────────────────────────────────────── */

function EditEventDialog({
  event,
  onEdit,
  onClose,
}: {
  event: Event;
  onEdit: (id: string, data: Record<string, string | null>) => Promise<void>;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && setOpen(v)}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100">
          <EditPencil className="size-4" strokeWidth={1.7} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">Editar Evento</DialogTitle>
        </DialogHeader>
        <EventForm
          event={event}
          isPending={isPending}
          error={error}
          submitLabel="Salvar Alterações"
          submittingLabel="Salvando..."
          onSubmit={async (data) => {
            setIsPending(true);
            setError(null);
            try {
              await onEdit(event.id, data);
              setOpen(false);
              onClose?.();
            } catch {
              setError("Erro ao salvar evento");
            } finally {
              setIsPending(false);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────────────── */
/*  New Event Dialog                                                 */
/* ────────────────────────────────────────────────────────────────── */

function NewEventDialog({
  onCreate,
}: {
  onCreate: (data: Record<string, string | null>) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && setOpen(v)}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-xl">
          <Plus className="size-4 mr-1.5" /> Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">Novo Evento</DialogTitle>
        </DialogHeader>
        <EventForm
          isPending={isPending}
          error={error}
          submitLabel="Criar Evento"
          submittingLabel="Criando..."
          onSubmit={async (data) => {
            setIsPending(true);
            setError(null);
            try {
              await onCreate(data);
              setOpen(false);
            } catch {
              setError("Erro ao criar evento");
            } finally {
              setIsPending(false);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
