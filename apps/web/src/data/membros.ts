import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { memberProfile, memberHistory } from "@/db/app-schema";
import { user, member } from "@/db/auth-schema";

export async function getOrgMembers(orgId: string) {
  return db
    .select({
      id: memberProfile.id,
      userId: memberProfile.userId,
      grau: memberProfile.grau,
      cargo: memberProfile.cargo,
      telefone: memberProfile.telefone,
      cim: memberProfile.cim,
      ativo: memberProfile.ativo,
      createdAt: memberProfile.createdAt,
      userName: user.name,
      userEmail: user.email,
      userImage: user.image,
      role: member.role,
    })
    .from(memberProfile)
    .innerJoin(user, eq(memberProfile.userId, user.id))
    .innerJoin(
      member,
      and(
        eq(member.userId, memberProfile.userId),
        eq(member.organizationId, memberProfile.organizationId),
      ),
    )
    .where(eq(memberProfile.organizationId, orgId))
    .orderBy(memberProfile.createdAt);
}

export async function getMemberById(orgId: string, id: string) {
  const rows = await db
    .select({
      id: memberProfile.id,
      userId: memberProfile.userId,
      grau: memberProfile.grau,
      cargo: memberProfile.cargo,
      telefone: memberProfile.telefone,
      dataNascimento: memberProfile.dataNascimento,
      dataIniciacao: memberProfile.dataIniciacao,
      dataElevacao: memberProfile.dataElevacao,
      dataExaltacao: memberProfile.dataExaltacao,
      cim: memberProfile.cim,
      ativo: memberProfile.ativo,
      createdAt: memberProfile.createdAt,
      updatedAt: memberProfile.updatedAt,
      userName: user.name,
      userEmail: user.email,
      userImage: user.image,
      role: member.role,
    })
    .from(memberProfile)
    .innerJoin(user, eq(memberProfile.userId, user.id))
    .innerJoin(
      member,
      and(
        eq(member.userId, memberProfile.userId),
        eq(member.organizationId, memberProfile.organizationId),
      ),
    )
    .where(and(eq(memberProfile.organizationId, orgId), eq(memberProfile.id, id)))
    .limit(1);

  return rows[0] ?? null;
}

export async function getMemberByUserId(orgId: string, userId: string) {
  const rows = await db
    .select()
    .from(memberProfile)
    .where(
      and(eq(memberProfile.organizationId, orgId), eq(memberProfile.userId, userId)),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function createMemberProfile(data: {
  userId: string;
  organizationId: string;
  grau?: "1" | "2" | "3";
  cargo?: string | null;
}) {
  const [row] = await db
    .insert(memberProfile)
    .values({
      userId: data.userId,
      organizationId: data.organizationId,
      grau: data.grau ?? "1",
      cargo: data.cargo as typeof memberProfile.$inferInsert.cargo,
    })
    .returning();
  return row;
}

export async function updateMemberProfile(
  id: string,
  data: Partial<{
    grau: "1" | "2" | "3";
    cargo: string | null;
    telefone: string | null;
    dataNascimento: Date | null;
    dataIniciacao: Date | null;
    dataElevacao: Date | null;
    dataExaltacao: Date | null;
    cim: string | null;
    ativo: boolean;
  }>,
) {
  const [row] = await db
    .update(memberProfile)
    .set(data as typeof memberProfile.$inferInsert)
    .where(eq(memberProfile.id, id))
    .returning();
  return row;
}

export async function deactivateMember(id: string) {
  return updateMemberProfile(id, { ativo: false });
}

export async function getMemberHistory(memberProfileId: string) {
  return db
    .select({
      id: memberHistory.id,
      campo: memberHistory.campo,
      valorAnterior: memberHistory.valorAnterior,
      valorNovo: memberHistory.valorNovo,
      alteradoPor: memberHistory.alteradoPor,
      createdAt: memberHistory.createdAt,
      alteradoPorNome: user.name,
    })
    .from(memberHistory)
    .innerJoin(user, eq(memberHistory.alteradoPor, user.id))
    .where(eq(memberHistory.memberProfileId, memberProfileId))
    .orderBy(desc(memberHistory.createdAt));
}

export async function createHistoryEntry(data: {
  memberProfileId: string;
  campo: string;
  valorAnterior: string | null;
  valorNovo: string | null;
  alteradoPor: string;
}) {
  const [row] = await db.insert(memberHistory).values(data).returning();
  return row;
}
