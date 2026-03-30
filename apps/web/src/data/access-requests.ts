import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { accessRequests } from "@/db/app-schema";
import { user } from "@/db/auth-schema";

export async function createAccessRequest(userId: string, mensagem?: string) {
  // Check for existing pending request
  const [existing] = await db
    .select()
    .from(accessRequests)
    .where(
      and(
        eq(accessRequests.userId, userId),
        eq(accessRequests.status, "pendente"),
      ),
    )
    .limit(1);

  if (existing) return existing;

  const [request] = await db
    .insert(accessRequests)
    .values({
      userId,
      mensagem: mensagem ?? null,
    })
    .returning();
  return request;
}

export async function getPendingRequests() {
  return db
    .select({
      id: accessRequests.id,
      userId: accessRequests.userId,
      mensagem: accessRequests.mensagem,
      status: accessRequests.status,
      createdAt: accessRequests.createdAt,
      userName: user.name,
      userEmail: user.email,
      userImage: user.image,
    })
    .from(accessRequests)
    .innerJoin(user, eq(accessRequests.userId, user.id))
    .where(eq(accessRequests.status, "pendente"))
    .orderBy(desc(accessRequests.createdAt));
}

export async function resolveRequest(
  id: string,
  status: "aprovado" | "recusado",
  resolvidoPor: string,
) {
  const [updated] = await db
    .update(accessRequests)
    .set({
      status,
      resolvidoPor,
      resolvidoEm: new Date(),
    })
    .where(eq(accessRequests.id, id))
    .returning();
  return updated;
}

export async function getUserPendingRequest(userId: string) {
  const [request] = await db
    .select()
    .from(accessRequests)
    .where(
      and(
        eq(accessRequests.userId, userId),
        eq(accessRequests.status, "pendente"),
      ),
    )
    .limit(1);
  return request ?? null;
}
