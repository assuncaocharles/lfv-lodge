"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  NavArrowLeft,
  NavArrowRight,
  Plus,
  GoogleCircle,
  EditPencil,
  Trash,
} from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useMutation } from "@/hooks/use-mutation";

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
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function formatTime(dateStr: string): string {
  return formatSaoPauloTime(new Date(dateStr));
}

function toGoogleCalendarDate(dateStr: string): string {
  return new Date(dateStr)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function getGoogleCalendarUrl(event: Event): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.titulo,
    dates: `${toGoogleCalendarDate(event.dataInicio)}/${event.dataFim ? toGoogleCalendarDate(event.dataFim) : toGoogleCalendarDate(event.dataInicio)}`,
  });
  if (event.descricao) params.set("details", event.descricao);
  if (event.local) params.set("location", event.local);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function toDatetimeLocal(dateStr: string): string {
  return toSaoPauloDatetimeLocal(new Date(dateStr));
}

export function CalendarView({
  events,
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

  function navigate(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    router.push(
      `/calendario?mes=${newYear}-${String(newMonth).padStart(2, "0")}`
    );
  }

  return (
    <div
      className="space-y-5 animate-fade-up"
      style={{ animationFillMode: "both" }}
    >
      {/* Navigation bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white rounded-2xl shadow-card px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl hover:bg-neutral-100 transition-all duration-200"
          >
            <NavArrowLeft className="size-4 text-neutral-500" />
          </Button>
          <h2 className="font-display text-xl font-semibold min-w-[180px] text-center tracking-tight text-neutral-900">
            {MESES[month - 1]} <span className="text-neutral-400">{year}</span>
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(1)}
            className="rounded-xl hover:bg-neutral-100 transition-all duration-200"
          >
            <NavArrowRight className="size-4 text-neutral-500" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-neutral-100 p-1 dark:bg-white/5">
            <button
              onClick={() => setView("mes")}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-[13px] font-medium cursor-pointer transition-all duration-200",
                view === "mes"
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-white/10 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              )}
            >
              Mês
            </button>
            <button
              onClick={() => setView("lista")}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-[13px] font-medium cursor-pointer transition-all duration-200",
                view === "lista"
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-white/10 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              )}
            >
              Lista
            </button>
          </div>
          <a
            href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feedUrl.replace(/^https?:\/\//, "webcal://"))}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl transition-all duration-200 text-[13px] gap-1.5"
            >
              <GoogleCircle className="size-4" />
              Google Calendar
            </Button>
          </a>
          {isAdmin && <NewEventDialog />}
        </div>
      </div>

      {view === "mes" ? (
        <MonthView events={events} year={year} month={month} />
      ) : (
        <ListView events={events} isAdmin={isAdmin} />
      )}
    </div>
  );
}

function MonthView({
  events,
  year,
  month,
}: {
  events: Event[];
  year: number;
  month: number;
}) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month - 1;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function getEventsForDay(day: number) {
    return events.filter((e) => new Date(e.dataInicio).getDate() === day);
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="grid grid-cols-7 border-b border-neutral-200">
        {DIAS_SEMANA.map((d) => (
          <div
            key={d}
            className="p-3 text-center text-[11px] font-semibold text-neutral-400 uppercase tracking-wider"
          >
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
                "min-h-[96px] border-b border-r border-neutral-100 p-2 transition-all duration-200",
                day && "hover:bg-neutral-50",
                !day && "bg-neutral-50/50"
              )}
            >
              {day && (
                <>
                  <span
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-lg text-[13px] font-medium",
                      isToday
                        ? "bg-neutral-900 text-white font-bold dark:bg-white dark:text-neutral-900"
                        : "text-neutral-600"
                    )}
                  >
                    {day}
                  </span>
                  <div className="space-y-0.5 mt-1">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div
                        key={e.id}
                        className="truncate rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700 font-medium dark:bg-blue-500/10 dark:text-blue-400"
                        title={`${e.titulo}${!e.diaInteiro ? ` · ${formatTime(e.dataInicio)}` : ""}`}
                      >
                        {!e.diaInteiro && (
                          <span className="text-blue-500 dark:text-blue-300 mr-0.5">
                            {formatTime(e.dataInicio)}
                          </span>
                        )}
                        {e.titulo}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-neutral-400 px-1.5 font-medium">
                        +{dayEvents.length - 2}
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
  );
}

function ListView({
  events,
  isAdmin,
}: {
  events: Event[];
  isAdmin: boolean;
}) {
  const { mutate } = useMutation();

  if (events.length === 0) {
    return (
      <div className="rounded-2xl bg-white shadow-card p-12 text-center text-[13px] text-neutral-500">
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
              "flex gap-4 rounded-xl bg-white shadow-card p-4",
              "transition-all duration-200 hover:shadow-card-hover hover:-translate-y-px",
              `animate-fade-up stagger-${Math.min(i + 1, 6)}`
            )}
            style={{ animationFillMode: "both" }}
          >
            <div className="text-center shrink-0 w-14">
              <div className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
                {date.getDate()}
              </div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">
                {date.toLocaleDateString("pt-BR", { weekday: "short" })}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[15px] font-semibold text-neutral-900 tracking-tight">
                {event.titulo}
              </p>
              {event.local && (
                <p className="text-[13px] text-neutral-500">{event.local}</p>
              )}
              {!event.diaInteiro && (
                <p className="text-[13px] text-neutral-400">
                  {formatTime(event.dataInicio)}
                  {event.dataFim && ` — ${formatTime(event.dataFim)}`}
                </p>
              )}
              {event.descricao && (
                <p className="text-[13px] text-neutral-500 mt-1 line-clamp-2">
                  {event.descricao}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {isAdmin && (
                <>
                  <EditEventDialog event={event} />
                  <ConfirmDialog
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                      >
                        <Trash className="size-4" strokeWidth={1.7} />
                      </Button>
                    }
                    title="Excluir Evento"
                    description={`Tem certeza que deseja excluir ${event.titulo}? Esta ação não pode ser desfeita.`}
                    confirmLabel="Excluir"
                    confirmingLabel="Excluindo..."
                    onConfirm={async () => {
                      await mutate(() =>
                        fetch(`/api/eventos/${event.id}`, { method: "DELETE" })
                      );
                    }}
                  />
                </>
              )}
              <a
                href={getGoogleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                title="Adicionar ao Google Calendar"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-xl hover:bg-neutral-100 transition-all duration-200"
                >
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

function EditEventDialog({ event }: { event: Event }) {
  const [open, setOpen] = useState(false);

  const { mutate, isPending, error } = useMutation({
    onSuccess: () => setOpen(false),
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    await mutate(() =>
      fetch(`/api/eventos/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.get("titulo"),
          descricao: form.get("descricao") || null,
          local: form.get("local") || null,
          dataInicio: form.get("dataInicio"),
          dataFim: form.get("dataFim") || null,
          grauMinimo: form.get("grauMinimo"),
        }),
      })
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && setOpen(v)}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all duration-200"
        >
          <EditPencil className="size-4" strokeWidth={1.7} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight text-neutral-900">
            Editar Evento
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-500 font-medium">
              Título
            </Label>
            <Input
              name="titulo"
              defaultValue={event.titulo}
              required
              disabled={isPending}
              className="rounded-xl bg-neutral-50 border-neutral-200 h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-500 font-medium">
              Descrição
            </Label>
            <Textarea
              name="descricao"
              defaultValue={event.descricao ?? ""}
              rows={2}
              disabled={isPending}
              className="rounded-xl bg-neutral-50 border-neutral-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-500 font-medium">
              Local
            </Label>
            <Input
              name="local"
              defaultValue={event.local ?? ""}
              disabled={isPending}
              className="rounded-xl bg-neutral-50 border-neutral-200 h-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[13px] text-neutral-500 font-medium">
                Início
              </Label>
              <Input
                name="dataInicio"
                type="datetime-local"
                defaultValue={toDatetimeLocal(event.dataInicio)}
                required
                disabled={isPending}
                className="rounded-xl bg-neutral-50 border-neutral-200 h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] text-neutral-500 font-medium">
                Fim
              </Label>
              <Input
                name="dataFim"
                type="datetime-local"
                defaultValue={
                  event.dataFim ? toDatetimeLocal(event.dataFim) : ""
                }
                disabled={isPending}
                className="rounded-xl bg-neutral-50 border-neutral-200 h-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-500 font-medium">
              Grau Mínimo
            </Label>
            <Select name="grauMinimo" defaultValue={event.grauMinimo} disabled={isPending}>
              <SelectTrigger className="rounded-xl bg-neutral-50 border-neutral-200 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GRAU_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl h-10 transition-all duration-200"
          >
            {isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NewEventDialog() {
  const [open, setOpen] = useState(false);

  const { mutate, isPending, error } = useMutation({
    onSuccess: () => setOpen(false),
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    await mutate(() =>
      fetch("/api/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.get("titulo"),
          descricao: form.get("descricao") || undefined,
          local: form.get("local") || undefined,
          dataInicio: form.get("dataInicio"),
          dataFim: form.get("dataFim") || undefined,
          grauMinimo: form.get("grauMinimo"),
        }),
      })
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && setOpen(v)}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-xl transition-all duration-200">
          <Plus className="size-4 mr-1.5" /> Evento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight text-neutral-900">
            Novo Evento
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-500 font-medium">
              Título
            </Label>
            <Input
              name="titulo"
              required
              disabled={isPending}
              className="rounded-xl bg-neutral-50 border-neutral-200 h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-500 font-medium">
              Descrição
            </Label>
            <Textarea
              name="descricao"
              rows={2}
              disabled={isPending}
              className="rounded-xl bg-neutral-50 border-neutral-200"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-500 font-medium">
              Local
            </Label>
            <Input
              name="local"
              disabled={isPending}
              className="rounded-xl bg-neutral-50 border-neutral-200 h-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[13px] text-neutral-500 font-medium">
                Início
              </Label>
              <Input
                name="dataInicio"
                type="datetime-local"
                required
                disabled={isPending}
                className="rounded-xl bg-neutral-50 border-neutral-200 h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] text-neutral-500 font-medium">
                Fim
              </Label>
              <Input
                name="dataFim"
                type="datetime-local"
                disabled={isPending}
                className="rounded-xl bg-neutral-50 border-neutral-200 h-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] text-neutral-500 font-medium">
              Grau Mínimo
            </Label>
            <Select name="grauMinimo" defaultValue="1" disabled={isPending}>
              <SelectTrigger className="rounded-xl bg-neutral-50 border-neutral-200 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GRAU_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-[13px] text-red-500">{error}</p>}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl h-10 transition-all duration-200"
          >
            {isPending ? "Criando..." : "Criar Evento"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
