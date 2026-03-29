import { eq } from "drizzle-orm";
import { db } from "@/db";
import { lojaInfo } from "@/db/app-schema";

export async function getLojaInfo(orgId: string) {
  const rows = await db
    .select()
    .from(lojaInfo)
    .where(eq(lojaInfo.organizationId, orgId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertLojaInfo(
  orgId: string,
  data: Partial<{
    nomeCompleto: string;
    numero: string;
    oriente: string;
    potencia: string;
    endereco: string;
    cep: string;
    cidade: string;
    estado: string;
    telefone: string;
    email: string;
    pixChave: string;
    pixQrCode: string;
    diasSessao: string;
    horarioSessao: string;
    observacoes: string;
  }>,
) {
  const existing = await getLojaInfo(orgId);

  if (existing) {
    const [row] = await db
      .update(lojaInfo)
      .set(data)
      .where(eq(lojaInfo.organizationId, orgId))
      .returning();
    return row;
  }

  const [row] = await db
    .insert(lojaInfo)
    .values({ organizationId: orgId, ...data })
    .returning();
  return row;
}
