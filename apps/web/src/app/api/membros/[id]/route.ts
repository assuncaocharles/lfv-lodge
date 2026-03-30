import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import { getMemberById, updateMemberProfile } from "@/data/membros";
import { db } from "@/db";
import { user, account, member, session } from "@/db/auth-schema";
import { memberProfile, memberHistory } from "@/db/app-schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const member = await getMemberById(auth.orgId, id);
  if (!member) {
    return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
  }

  return NextResponse.json(member);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = await isLuz();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  // Convert date strings to Date objects
  for (const key of ["dataNascimento", "dataIniciacao", "dataElevacao", "dataExaltacao"]) {
    if (body[key] !== undefined) {
      body[key] = body[key] ? new Date(body[key]) : null;
    }
  }

  const updated = await updateMemberProfile(id, body);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = await isLuz();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
  }

  const { id } = await params;
  const memberData = await getMemberById(auth.orgId, id);
  if (!memberData) {
    return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
  }

  // Delete member history, profile, org membership, sessions, accounts, and user
  await db.delete(memberHistory).where(eq(memberHistory.memberProfileId, id));
  await db.delete(memberProfile).where(eq(memberProfile.id, id));
  await db.delete(member).where(
    and(
      eq(member.userId, memberData.userId),
      eq(member.organizationId, auth.orgId),
    ),
  );
  await db.delete(session).where(eq(session.userId, memberData.userId));
  await db.delete(account).where(eq(account.userId, memberData.userId));
  await db.delete(user).where(eq(user.id, memberData.userId));

  return NextResponse.json({ deleted: true });
}
