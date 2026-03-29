import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { trabalhos, envios } from "@/db/app-schema";
import { user } from "@/db/auth-schema";

export async function getAssignments(orgId: string, userId?: string) {
  const condition = userId
    ? and(eq(trabalhos.organizationId, orgId), eq(trabalhos.atribuidoA, userId))
    : eq(trabalhos.organizationId, orgId);

  return db
    .select({
      id: trabalhos.id,
      titulo: trabalhos.titulo,
      descricao: trabalhos.descricao,
      prazo: trabalhos.prazo,
      status: trabalhos.status,
      atribuidoA: trabalhos.atribuidoA,
      feedbackAdmin: trabalhos.feedbackAdmin,
      createdAt: trabalhos.createdAt,
      atribuidoANome: user.name,
    })
    .from(trabalhos)
    .innerJoin(user, eq(trabalhos.atribuidoA, user.id))
    .where(condition)
    .orderBy(desc(trabalhos.createdAt));
}

export async function getAssignmentById(orgId: string, id: string) {
  const rows = await db
    .select({
      id: trabalhos.id,
      titulo: trabalhos.titulo,
      descricao: trabalhos.descricao,
      prazo: trabalhos.prazo,
      status: trabalhos.status,
      atribuidoA: trabalhos.atribuidoA,
      criadoPor: trabalhos.criadoPor,
      feedbackAdmin: trabalhos.feedbackAdmin,
      createdAt: trabalhos.createdAt,
      updatedAt: trabalhos.updatedAt,
      atribuidoANome: user.name,
    })
    .from(trabalhos)
    .innerJoin(user, eq(trabalhos.atribuidoA, user.id))
    .where(and(eq(trabalhos.organizationId, orgId), eq(trabalhos.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createAssignment(data: {
  organizationId: string;
  titulo: string;
  descricao?: string;
  prazo?: Date;
  atribuidoA: string;
  criadoPor: string;
}) {
  const [row] = await db
    .insert(trabalhos)
    .values({
      ...data,
      prazo: data.prazo ?? null,
    })
    .returning();
  return row;
}

export async function updateAssignment(
  id: string,
  data: Partial<{
    titulo: string;
    descricao: string | null;
    prazo: Date | null;
    status: string;
    feedbackAdmin: string | null;
  }>,
) {
  const [row] = await db
    .update(trabalhos)
    .set(data as typeof trabalhos.$inferInsert)
    .where(eq(trabalhos.id, id))
    .returning();
  return row;
}

export async function deleteAssignment(id: string) {
  await db.delete(trabalhos).where(eq(trabalhos.id, id));
}

export async function getSubmissions(trabalhoId: string) {
  return db
    .select({
      id: envios.id,
      nomeArquivo: envios.nomeArquivo,
      mimeType: envios.mimeType,
      tamanho: envios.tamanho,
      comentario: envios.comentario,
      createdAt: envios.createdAt,
      userName: user.name,
    })
    .from(envios)
    .innerJoin(user, eq(envios.userId, user.id))
    .where(eq(envios.trabalhoId, trabalhoId))
    .orderBy(desc(envios.createdAt));
}

export async function createSubmission(data: {
  trabalhoId: string;
  userId: string;
  storageKey: string;
  nomeArquivo: string;
  mimeType: string;
  tamanho: number;
  comentario?: string;
}) {
  const [row] = await db
    .insert(envios)
    .values({
      ...data,
      comentario: data.comentario ?? null,
    })
    .returning();
  return row;
}
