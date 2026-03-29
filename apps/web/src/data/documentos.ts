import { eq, and, lte, isNull, desc } from "drizzle-orm";
import { db } from "@/db";
import { documentos } from "@/db/app-schema";
import { user } from "@/db/auth-schema";

type Grau = "1" | "2" | "3";

export async function getFolderContents(
  orgId: string,
  pastaId: string | null,
  grau: Grau,
) {
  const condition = pastaId
    ? and(
        eq(documentos.organizationId, orgId),
        eq(documentos.pastaPaiId, pastaId),
        lte(documentos.grauMinimo, grau),
      )
    : and(
        eq(documentos.organizationId, orgId),
        isNull(documentos.pastaPaiId),
        lte(documentos.grauMinimo, grau),
      );

  return db
    .select({
      id: documentos.id,
      tipo: documentos.tipo,
      nome: documentos.nome,
      descricao: documentos.descricao,
      storageKey: documentos.storageKey,
      mimeType: documentos.mimeType,
      tamanho: documentos.tamanho,
      grauMinimo: documentos.grauMinimo,
      criadoPor: documentos.criadoPor,
      createdAt: documentos.createdAt,
      criadoPorNome: user.name,
    })
    .from(documentos)
    .innerJoin(user, eq(documentos.criadoPor, user.id))
    .where(condition)
    .orderBy(documentos.tipo, documentos.nome);
}

export async function getDocumentById(orgId: string, id: string) {
  const rows = await db
    .select()
    .from(documentos)
    .where(and(eq(documentos.organizationId, orgId), eq(documentos.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createFolder(data: {
  organizationId: string;
  nome: string;
  pastaPaiId?: string | null;
  grauMinimo?: "1" | "2" | "3";
  criadoPor: string;
}) {
  const [row] = await db
    .insert(documentos)
    .values({
      organizationId: data.organizationId,
      nome: data.nome,
      pastaPaiId: data.pastaPaiId ?? null,
      tipo: "folder",
      grauMinimo: data.grauMinimo ?? "1",
      criadoPor: data.criadoPor,
    })
    .returning();
  return row;
}

export async function createDocument(data: {
  organizationId: string;
  nome: string;
  pastaPaiId?: string | null;
  tipo: "pdf" | "ppt" | "doc" | "image" | "other";
  storageKey: string;
  mimeType: string;
  tamanho: number;
  grauMinimo?: "1" | "2" | "3";
  criadoPor: string;
}) {
  const [row] = await db
    .insert(documentos)
    .values({
      ...data,
      pastaPaiId: data.pastaPaiId ?? null,
      grauMinimo: data.grauMinimo ?? "1",
    })
    .returning();
  return row;
}

export async function updateDocument(
  id: string,
  data: Partial<{
    nome: string;
    grauMinimo: "1" | "2" | "3";
    descricao: string | null;
  }>,
) {
  const [row] = await db
    .update(documentos)
    .set(data)
    .where(eq(documentos.id, id))
    .returning();
  return row;
}

export async function deleteDocument(id: string) {
  await db.delete(documentos).where(eq(documentos.id, id));
}

export async function getBreadcrumbs(docId: string): Promise<{ id: string; nome: string }[]> {
  const crumbs: { id: string; nome: string }[] = [];
  let currentId: string | null = docId;

  while (currentId) {
    const [doc] = await db
      .select({ id: documentos.id, nome: documentos.nome, pastaPaiId: documentos.pastaPaiId })
      .from(documentos)
      .where(eq(documentos.id, currentId))
      .limit(1);

    if (!doc) break;
    crumbs.unshift({ id: doc.id, nome: doc.nome });
    currentId = doc.pastaPaiId;
  }

  return crumbs;
}
