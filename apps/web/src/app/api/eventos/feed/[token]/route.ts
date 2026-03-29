import { NextRequest, NextResponse } from "next/server";
import { verifyFeedToken } from "@/lib/feed-token";
import { getAllEventsForIcal } from "@/data/eventos";

function formatIcalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const data = verifyFeedToken(token);
  if (!data) {
    return NextResponse.json({ error: "Token invalido" }, { status: 401 });
  }

  const events = await getAllEventsForIcal(data.orgId, data.grau);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Labor Forca e Virtude 003//my-columns//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:LFV 003 - Calendario",
    "X-WR-TIMEZONE:America/Sao_Paulo",
  ];

  for (const event of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.id}@my-columns`);
    lines.push(`DTSTART:${formatIcalDate(event.dataInicio)}`);
    if (event.dataFim) {
      lines.push(`DTEND:${formatIcalDate(event.dataFim)}`);
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
