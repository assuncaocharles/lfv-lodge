import { NextRequest, NextResponse } from "next/server";
import { scryptSync, randomBytes } from "node:crypto";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import { db } from "@/db";
import { sendWelcomeEmail } from "@/lib/resend";
import { user, account, member } from "@/db/auth-schema";
import { memberProfile } from "@/db/app-schema";

export async function POST(req: NextRequest) {
  const authResult = await getAuthenticatedUser();
  if (!authResult || !authResult.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = await isLuz();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
  }

  const body = await req.json();
  const { email, password, role: memberRole, grau, cargo } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email e senha são obrigatórios" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "A senha deve ter pelo menos 6 caracteres" },
      { status: 400 }
    );
  }

  // Check if user already exists
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existingUser) {
    // Check if already a member of this org
    const [existingMember] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, existingUser.id),
          eq(member.organizationId, authResult.orgId)
        )
      )
      .limit(1);

    if (existingMember) {
      return NextResponse.json(
        { error: "Este email já é membro da loja" },
        { status: 400 }
      );
    }
  }

  try {
    const userId = existingUser?.id ?? crypto.randomUUID();

    // Create user if doesn't exist
    if (!existingUser) {
      await db.insert(user).values({
        id: userId,
        name: email.split("@")[0],
        email,
        emailVerified: true,
      });

      // Create credential account with password
      const salt = randomBytes(16).toString("hex");
      const key = scryptSync(password, salt, 64, {
        N: 16384,
        r: 16,
        p: 1,
        maxmem: 128 * 16384 * 16 * 2,
      });
      const hashedPassword = `${salt}:${key.toString("hex")}`;

      await db.insert(account).values({
        id: crypto.randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: hashedPassword,
      });
    }

    // Add as org member
    await db.insert(member).values({
      id: crypto.randomUUID(),
      organizationId: authResult.orgId,
      userId,
      role: memberRole === "admin" ? "admin" : "member",
    });

    // Create member profile
    await db.insert(memberProfile).values({
      id: crypto.randomUUID(),
      userId,
      organizationId: authResult.orgId,
      grau: (grau as "1" | "2" | "3") ?? "1",
      cargo: cargo ?? null,
    });

    // Send welcome email with credentials
    const loginUrl = `${process.env.BETTER_AUTH_URL}/login`;
    try {
      await sendWelcomeEmail({
        to: email,
        lojaName: "Labor, Força e Virtude Nº 003",
        email,
        password,
        loginUrl,
      });
    } catch (emailErr) {
      console.error("Erro ao enviar email:", emailErr);
      // Member was created, don't fail the request
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar membro:", err);
    return NextResponse.json(
      { error: "Erro ao criar membro" },
      { status: 500 }
    );
  }
}
