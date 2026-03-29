import { eq, and, lte, gte, desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { eventos } from "@/db/app-schema";
import { user } from "@/db/auth-schema";

type Grau = "1" | "2" | "3";

export async function getEventsByRange(
  orgId: string,
  start: Date,
  end: Date,
  grau: Grau,
) {
  return db
    .select({
      id: eventos.id,
      titulo: eventos.titulo,
      descricao: eventos.descricao,
      local: eventos.local,
      dataInicio: eventos.dataInicio,
      dataFim: eventos.dataFim,
      diaInteiro: eventos.diaInteiro,
      grauMinimo: eventos.grauMinimo,
      criadoPorNome: user.name,
    })
    .from(eventos)
    .innerJoin(user, eq(eventos.criadoPor, user.id))
    .where(
      and(
        eq(eventos.organizationId, orgId),
        gte(eventos.dataInicio, start),
        lte(eventos.dataInicio, end),
        lte(eventos.grauMinimo, grau),
      ),
    )
    .orderBy(asc(eventos.dataInicio));
}

export async function getUpcomingEvents(orgId: string, grau: Grau, limit = 5) {
  return db
    .select({
      id: eventos.id,
      titulo: eventos.titulo,
      descricao: eventos.descricao,
      local: eventos.local,
      dataInicio: eventos.dataInicio,
      dataFim: eventos.dataFim,
      diaInteiro: eventos.diaInteiro,
      grauMinimo: eventos.grauMinimo,
    })
    .from(eventos)
    .where(
      and(
        eq(eventos.organizationId, orgId),
        gte(eventos.dataInicio, new Date()),
        lte(eventos.grauMinimo, grau),
      ),
    )
    .orderBy(asc(eventos.dataInicio))
    .limit(limit);
}

export async function getEventById(orgId: string, id: string) {
  const rows = await db
    .select()
    .from(eventos)
    .where(and(eq(eventos.organizationId, orgId), eq(eventos.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createEvent(data: {
  organizationId: string;
  titulo: string;
  descricao?: string;
  local?: string;
  dataInicio: Date;
  dataFim?: Date;
  diaInteiro?: boolean;
  grauMinimo?: "1" | "2" | "3";
  criadoPor: string;
}) {
  const [row] = await db
    .insert(eventos)
    .values({
      ...data,
      grauMinimo: data.grauMinimo ?? "1",
      diaInteiro: data.diaInteiro ?? false,
    })
    .returning();
  return row;
}

export async function updateEvent(
  id: string,
  data: Partial<{
    titulo: string;
    descricao: string | null;
    local: string | null;
    dataInicio: Date;
    dataFim: Date | null;
    diaInteiro: boolean;
    grauMinimo: "1" | "2" | "3";
  }>,
) {
  const [row] = await db
    .update(eventos)
    .set(data)
    .where(eq(eventos.id, id))
    .returning();
  return row;
}

export async function deleteEvent(id: string) {
  await db.delete(eventos).where(eq(eventos.id, id));
}

export async function getAllEventsForIcal(orgId: string, grau: Grau) {
  return db
    .select({
      id: eventos.id,
      titulo: eventos.titulo,
      descricao: eventos.descricao,
      local: eventos.local,
      dataInicio: eventos.dataInicio,
      dataFim: eventos.dataFim,
      diaInteiro: eventos.diaInteiro,
    })
    .from(eventos)
    .where(
      and(
        eq(eventos.organizationId, orgId),
        lte(eventos.grauMinimo, grau),
      ),
    )
    .orderBy(asc(eventos.dataInicio));
}
