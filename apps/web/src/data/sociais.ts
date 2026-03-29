import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { socialLinks } from "@/db/app-schema";

export async function getSocialLinks(orgId: string) {
  return db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.organizationId, orgId))
    .orderBy(asc(socialLinks.ordem));
}

export async function createSocialLink(data: {
  organizationId: string;
  plataforma: string;
  titulo: string;
  url: string;
  icone?: string;
  ordem?: number;
}) {
  const [row] = await db
    .insert(socialLinks)
    .values({
      ...data,
      ordem: data.ordem ?? 0,
    })
    .returning();
  return row;
}

export async function updateSocialLink(
  id: string,
  data: Partial<{
    plataforma: string;
    titulo: string;
    url: string;
    icone: string;
    ordem: number;
  }>,
) {
  const [row] = await db
    .update(socialLinks)
    .set(data)
    .where(eq(socialLinks.id, id))
    .returning();
  return row;
}

export async function deleteSocialLink(id: string) {
  await db.delete(socialLinks).where(eq(socialLinks.id, id));
}
