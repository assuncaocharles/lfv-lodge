import { eq, and, lte, gte, or, isNull, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import { notificacoes, notificacoesLidas } from "@/db/app-schema";
import { user } from "@/db/auth-schema";

function buildAudienceFilter(grau: string, role: string) {
  const conditions = [eq(notificacoes.publicoAlvo, "todos")];

  if (role === "owner" || role === "admin") {
    conditions.push(eq(notificacoes.publicoAlvo, "luz"));
  }

  if (grau >= "1") conditions.push(eq(notificacoes.publicoAlvo, "grau_1"));
  if (grau >= "2") conditions.push(eq(notificacoes.publicoAlvo, "grau_2"));
  if (grau >= "3") conditions.push(eq(notificacoes.publicoAlvo, "grau_3"));

  return or(...conditions)!;
}

export async function getActiveNotifications(
  orgId: string,
  grau: string,
  role: string,
) {
  const now = new Date();

  return db
    .select({
      id: notificacoes.id,
      titulo: notificacoes.titulo,
      corpo: notificacoes.corpo,
      publicoAlvo: notificacoes.publicoAlvo,
      expiraEm: notificacoes.expiraEm,
      criadoPor: notificacoes.criadoPor,
      createdAt: notificacoes.createdAt,
      criadoPorNome: user.name,
    })
    .from(notificacoes)
    .innerJoin(user, eq(notificacoes.criadoPor, user.id))
    .where(
      and(
        eq(notificacoes.organizationId, orgId),
        buildAudienceFilter(grau, role),
        or(isNull(notificacoes.expiraEm), gte(notificacoes.expiraEm, now)),
      ),
    )
    .orderBy(desc(notificacoes.createdAt));
}

export async function getUnreadCount(
  orgId: string,
  userId: string,
  grau: string,
  role: string,
) {
  const now = new Date();

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notificacoes)
    .leftJoin(
      notificacoesLidas,
      and(
        eq(notificacoesLidas.notificacaoId, notificacoes.id),
        eq(notificacoesLidas.userId, userId),
      ),
    )
    .where(
      and(
        eq(notificacoes.organizationId, orgId),
        buildAudienceFilter(grau, role),
        or(isNull(notificacoes.expiraEm), gte(notificacoes.expiraEm, now)),
        isNull(notificacoesLidas.id),
      ),
    );

  return Number(result[0]?.count ?? 0);
}

export async function getNotificationById(orgId: string, id: string) {
  const rows = await db
    .select()
    .from(notificacoes)
    .where(and(eq(notificacoes.organizationId, orgId), eq(notificacoes.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createNotification(data: {
  organizationId: string;
  titulo: string;
  corpo: string;
  publicoAlvo?: string;
  expiraEm?: Date;
  enviarEmail?: boolean;
  criadoPor: string;
}) {
  const [row] = await db
    .insert(notificacoes)
    .values({
      organizationId: data.organizationId,
      titulo: data.titulo,
      corpo: data.corpo,
      publicoAlvo: (data.publicoAlvo ?? "todos") as typeof notificacoes.$inferInsert.publicoAlvo,
      expiraEm: data.expiraEm ?? null,
      enviarEmail: data.enviarEmail ?? false,
      criadoPor: data.criadoPor,
    })
    .returning();
  return row;
}

export async function deleteNotification(id: string) {
  await db.delete(notificacoes).where(eq(notificacoes.id, id));
}

export async function markAsRead(notificacaoId: string, userId: string) {
  await db
    .insert(notificacoesLidas)
    .values({ notificacaoId, userId })
    .onConflictDoNothing();
}

export async function markMultipleAsRead(ids: string[], userId: string) {
  for (const id of ids) {
    await markAsRead(id, userId);
  }
}

export async function getReadIds(userId: string, notificationIds: string[]) {
  if (notificationIds.length === 0) return new Set<string>();

  const rows = await db
    .select({ notificacaoId: notificacoesLidas.notificacaoId })
    .from(notificacoesLidas)
    .where(
      and(
        eq(notificacoesLidas.userId, userId),
        sql`${notificacoesLidas.notificacaoId} = ANY(${notificationIds})`,
      ),
    );

  return new Set(rows.map((r) => r.notificacaoId));
}
