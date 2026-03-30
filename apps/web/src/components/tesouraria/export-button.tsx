"use client";

import { Download } from "iconoir-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Caixa } from "@/lib/tesouraria-constants";

interface ExportButtonProps {
  caixa: Caixa;
  mes: string;
}

export function ExportButton({ caixa, mes }: ExportButtonProps) {
  function download(formato: string) {
    const url = `/api/tesouraria/export?formato=${formato}&caixa=${caixa}&mes=${mes}`;
    window.open(url, "_blank");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="size-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => download("csv")}>
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => download("xlsx")}>
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => download("pdf")}>
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
