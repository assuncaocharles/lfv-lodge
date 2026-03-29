import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { scryptSync, randomBytes } from "node:crypto";
import * as authSchema from "../db/auth-schema";
import * as appSchema from "../db/app-schema";

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });
  const db = drizzle(pool, { schema: { ...authSchema, ...appSchema } });

  const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("Defina SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD no .env.local");
    process.exit(1);
  }

  // 1. Upsert organization
  let [org] = await db.select().from(authSchema.organization).where(eq(authSchema.organization.slug, "minha-loja")).limit(1);
  if (!org) {
    [org] = await db.insert(authSchema.organization).values({
      id: crypto.randomUUID(),
      name: "Minha Loja",
      slug: "minha-loja",
    }).returning();
    console.log(`Organizacao criada: ${org.id}`);
  } else {
    console.log(`Organizacao ja existe: ${org.id}`);
  }

  // 2. Upsert user
  let [usr] = await db.select().from(authSchema.user).where(eq(authSchema.user.email, ADMIN_EMAIL)).limit(1);
  if (!usr) {
    [usr] = await db.insert(authSchema.user).values({
      id: crypto.randomUUID(),
      name: "Administrador",
      email: ADMIN_EMAIL,
      emailVerified: true,
    }).returning();
    console.log(`Usuario criado: ${usr.id}`);
  } else {
    console.log(`Usuario ja existe: ${usr.id}`);
  }

  // 3. Upsert credential account
  const [existingAccount] = await db.select().from(authSchema.account).where(eq(authSchema.account.userId, usr.id)).limit(1);
  if (!existingAccount) {
    const salt = randomBytes(16).toString("hex");
    const key = scryptSync(ADMIN_PASSWORD, salt, 64, { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 });
    const hashedPassword = `${salt}:${key.toString("hex")}`;

    await db.insert(authSchema.account).values({
      id: crypto.randomUUID(),
      accountId: usr.id,
      providerId: "credential",
      userId: usr.id,
      password: hashedPassword,
    });
    console.log(`Conta com senha criada`);
  } else {
    console.log(`Conta ja existe`);
  }

  // 4. Upsert member
  const [existingMember] = await db.select().from(authSchema.member).where(eq(authSchema.member.userId, usr.id)).limit(1);
  if (!existingMember) {
    await db.insert(authSchema.member).values({
      id: crypto.randomUUID(),
      organizationId: org.id,
      userId: usr.id,
      role: "owner",
    });
    console.log(`Membro criado com role: owner`);
  } else {
    console.log(`Membro ja existe`);
  }

  // 5. Upsert member profile
  const [existingProfile] = await db.select().from(appSchema.memberProfile).where(eq(appSchema.memberProfile.userId, usr.id)).limit(1);
  if (!existingProfile) {
    await db.insert(appSchema.memberProfile).values({
      id: crypto.randomUUID(),
      userId: usr.id,
      organizationId: org.id,
      grau: "3",
      cargo: "veneravel_mestre",
    });
    console.log(`Perfil criado: Mestre Macom, Veneravel Mestre`);
  } else {
    console.log(`Perfil ja existe`);
  }

  console.log("\n--- Seed concluido! ---");
  console.log(`Login com: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

  await pool.end();
}

seed().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
