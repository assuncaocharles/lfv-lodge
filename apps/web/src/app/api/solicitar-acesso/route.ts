import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import {
  createAccessRequest,
  getPendingRequests,
  resolveRequest,
} from "@/data/access-requests";
import { db } from "@/db";
import { member } from "@/db/auth-schema";
import { memberProfile } from "@/db/app-schema";
import { eq, and } from "drizzle-orm";

// User submits a request
export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const request = await createAccessRequest(auth.user.id, body.mensagem);

  // Check if this was an existing request
  const isExisting = !body.mensagem && request.mensagem !== null;

  return NextResponse.json({ request, existing: isExisting }, { status: 201 });
}

// Admin fetches pending requests
export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = await isLuz();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
  }

  const requests = await getPendingRequests();
  return NextResponse.json(requests);
}

// Admin approves/rejects a request
export async function PUT(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = await isLuz();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
  }

  const body = await req.json();
  const { requestId, status, grau } = body;

  if (!requestId || !status) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const updated = await resolveRequest(requestId, status, auth.user.id);

  // If approved, create org membership + member profile
  if (status === "aprovado" && updated) {
    // Check if already a member
    const [existing] = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, updated.userId),
          eq(member.organizationId, auth.orgId),
        ),
      )
      .limit(1);

    if (!existing) {
      await db.insert(member).values({
        id: crypto.randomUUID(),
        organizationId: auth.orgId,
        userId: updated.userId,
        role: "member",
      });

      await db.insert(memberProfile).values({
        id: crypto.randomUUID(),
        userId: updated.userId,
        organizationId: auth.orgId,
        grau: (grau as "1" | "2" | "3") ?? "1",
      });
    }
  }

  return NextResponse.json(updated);
}
