"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, NavArrowLeft, NavArrowRight } from "iconoir-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  name: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({
  name,
  value: controlledValue,
  defaultValue,
  required,
  disabled,
  placeholder = "Selecionar data e hora",
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(() => {
    const val = controlledValue ?? defaultValue;
    return val ? new Date(val) : undefined;
  });
  const [hours, setHours] = useState(() => {
    const val = controlledValue ?? defaultValue;
    if (!val) return "19";
    return String(new Date(val).getHours()).padStart(2, "0");
  });
  const [minutes, setMinutes] = useState(() => {
    const val = controlledValue ?? defaultValue;
    if (!val) return "00";
    return String(new Date(val).getMinutes()).padStart(2, "0");
  });

  // Build the full datetime value for the hidden input
  function getDatetimeLocal(): string {
    if (!date) return "";
    const d = new Date(date);
    d.setHours(parseInt(hours) || 0);
    d.setMinutes(parseInt(minutes) || 0);
    d.setSeconds(0);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  }

  const displayValue = date
    ? `${format(date, "dd 'de' MMM, yyyy", { locale: ptBR })} · ${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`
    : null;

  return (
    <div className={className}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={getDatetimeLocal()} />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full h-11 rounded-xl bg-neutral-50 border-neutral-200 justify-start text-left font-normal text-[13px] hover:bg-neutral-100 dark:bg-white/5 dark:border-white/10",
              !date && "text-neutral-400"
            )}
          >
            <CalendarIcon className="size-4 text-neutral-400 mr-2" />
            {displayValue ?? placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-xl shadow-elevated" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
            }}
            locale={ptBR}
            className="rounded-t-xl"
          />

          {/* Time picker */}
          <div className="border-t border-neutral-200 dark:border-white/10 px-4 py-3 flex items-center gap-3">
            <Clock className="size-4 text-neutral-400" />
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={23}
                value={hours}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                  if (parseInt(v) <= 23 || v === "") setHours(v);
                }}
                onBlur={() => setHours(hours.padStart(2, "0"))}
                className="w-10 h-8 rounded-lg bg-neutral-100 dark:bg-white/10 text-center text-[14px] font-semibold border-0 outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-neutral-400 font-bold">:</span>
              <input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                  if (parseInt(v) <= 59 || v === "") setMinutes(v);
                }}
                onBlur={() => setMinutes(minutes.padStart(2, "0"))}
                className="w-10 h-8 rounded-lg bg-neutral-100 dark:bg-white/10 text-center text-[14px] font-semibold border-0 outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button
              type="button"
              size="sm"
              className="ml-auto rounded-lg text-[12px] h-8"
              onClick={() => setOpen(false)}
            >
              Confirmar
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* HTML validation for required */}
      {required && !date && (
        <input
          tabIndex={-1}
          required
          value=""
          onChange={() => {}}
          className="absolute opacity-0 w-0 h-0"
        />
      )}
    </div>
  );
}
