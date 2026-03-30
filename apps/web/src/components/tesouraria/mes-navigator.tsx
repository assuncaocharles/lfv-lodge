"use client";

import { NavArrowLeft, NavArrowRight } from "iconoir-react";
import { Button } from "@/components/ui/button";

interface MesNavigatorProps {
  mes: string;
  onChange: (mes: string) => void;
}

function formatMesLabel(mes: string): string {
  const [year, month] = mes.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function shiftMonth(mes: string, delta: number): string {
  const [year, month] = mes.split("-").map(Number);
  const d = new Date(year, month - 1 + delta);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function MesNavigator({ mes, onChange }: MesNavigatorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-xl size-8"
        onClick={() => onChange(shiftMonth(mes, -1))}
      >
        <NavArrowLeft className="size-4" />
      </Button>
      <span className="text-[13px] font-medium text-neutral-700 min-w-[140px] text-center capitalize">
        {formatMesLabel(mes)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-xl size-8"
        onClick={() => onChange(shiftMonth(mes, 1))}
      >
        <NavArrowRight className="size-4" />
      </Button>
    </div>
  );
}
