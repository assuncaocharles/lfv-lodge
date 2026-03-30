import { NextRequest, NextResponse } from "next/server";
import { verifyFeedToken } from "@/lib/feed-token";
import { getAllEventsForIcal } from "@/data/eventos";

const TIMEZONE = "America/Sao_Paulo";

function formatLocalDate(date: Date): string {
  // Format as local São Paulo time (no Z suffix)
  const sp = new Date(date.toLocaleString("en-US", { timeZone: TIMEZONE }));
  const y = sp.getFullYear();
  const m = String(sp.getMonth() + 1).padStart(2, "0");
  const d = String(sp.getDate()).padStart(2, "0");
  const h = String(sp.getHours()).padStart(2, "0");
  const min = String(sp.getMinutes()).padStart(2, "0");
  const s = String(sp.getSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${h}${min}${s}`;
}

// Standard VTIMEZONE for America/Sao_Paulo
const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  "TZID:America/Sao_Paulo",
  "BEGIN:STANDARD",
  "DTSTART:19700101T000000",
  "TZOFFSETFROM:-0300",
  "TZOFFSETTO:-0300",
  "TZNAME:BRT",
  "END:STANDARD",
  "END:VTIMEZONE",
].join("\r\n");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const data = verifyFeedToken(token);
  if (!data) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const events = await getAllEventsForIcal(data.orgId, data.grau);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Labor Força e Virtude 003//my-columns//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:LFV 003 - Calendário",
    `X-WR-TIMEZONE:${TIMEZONE}`,
    "X-PUBLISHED-TTL:PT30M",
    "REFRESH-INTERVAL;VALUE=DURATION:PT30M",
    VTIMEZONE,
  ];

  for (const event of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.id}@my-columns`);
    lines.push(`DTSTART;TZID=${TIMEZONE}:${formatLocalDate(event.dataInicio)}`);
    if (event.dataFim) {
      lines.push(`DTEND;TZID=${TIMEZONE}:${formatLocalDate(event.dataFim)}`);
    }
    lines.push(`SUMMARY:${event.titulo}`);
    if (event.descricao)
      lines.push(`DESCRIPTION:${event.descricao.replace(/\n/g, "\\n")}`);
    if (event.local) lines.push(`LOCATION:${event.local}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
