import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-utils";
import { getMemberByUserId } from "@/data/membros";
import { getAllEventsForIcal } from "@/data/eventos";

function formatIcalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const member = await getMemberByUserId(auth.orgId, auth.user.id);
  const grau = (member?.grau ?? "1") as "1" | "2" | "3";
  const events = await getAllEventsForIcal(auth.orgId, grau);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Labor Forca e Virtude 003//my-columns//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const event of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.id}@my-columns`);
    lines.push(`DTSTART:${formatIcalDate(event.dataInicio)}`);
    if (event.dataFim) {
      lines.push(`DTEND:${formatIcalDate(event.dataFim)}`);
    }
    lines.push(`SUMMARY:${event.titulo}`);
    if (event.descricao) lines.push(`DESCRIPTION:${event.descricao.replace(/\n/g, "\\n")}`);
    if (event.local) lines.push(`LOCATION:${event.local}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": "attachment; filename=loja-calendario.ics",
    },
  });
}
