"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps {
  value: number;
  onChange: (centavos: number) => void;
  id?: string;
  placeholder?: string;
}

export function CurrencyInput({ value, onChange, id, placeholder }: CurrencyInputProps) {
  const [display, setDisplay] = useState(() => formatDisplay(value));

  function formatDisplay(centavos: number): string {
    if (centavos === 0) return "";
    return (centavos / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d,]/g, "");
      setDisplay(raw);

      const cleaned = raw.replace(/\./g, "").replace(",", ".");
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed)) {
        onChange(Math.round(parsed * 100));
      } else {
        onChange(0);
      }
    },
    [onChange],
  );

  const handleBlur = useCallback(() => {
    setDisplay(formatDisplay(value));
  }, [value]);

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400">
        R$
      </span>
      <Input
        id={id}
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder ?? "0,00"}
        className="pl-9"
        inputMode="decimal"
      />
    </div>
  );
}
