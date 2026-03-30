/**
 * Parse a datetime-local string (e.g. "2026-03-30T20:00") as São Paulo time.
 *
 * datetime-local inputs don't include timezone info. On a UTC server (Railway),
 * `new Date("2026-03-30T20:00")` is treated as 20:00 UTC, but the user meant
 * 20:00 São Paulo (UTC-3). This function appends the correct offset.
 */
export function parseSaoPauloDate(value: string): Date {
  // If already has timezone info (ISO string with Z or offset), parse as-is
  if (value.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(value)) {
    return new Date(value);
  }

  // São Paulo is UTC-3 (Brazil hasn't observed DST since 2019)
  return new Date(`${value}:00-03:00`);
}

/**
 * Format a Date to a datetime-local string in São Paulo timezone.
 * Used to prefill form inputs with the correct local time.
 */
export function toSaoPauloDatetimeLocal(date: Date): string {
  const sp = new Date(
    date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const y = sp.getFullYear();
  const m = String(sp.getMonth() + 1).padStart(2, "0");
  const d = String(sp.getDate()).padStart(2, "0");
  const h = String(sp.getHours()).padStart(2, "0");
  const min = String(sp.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

/**
 * Format a Date to display time in São Paulo timezone.
 */
export function formatSaoPauloTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}
