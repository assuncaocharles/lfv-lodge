import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, getActiveRole, isLuz } from "@/lib/api-utils";
import { getMemberByUserId } from "@/data/membros";
import {
  getActiveNotifications,
  getUnreadCount,
  createNotification,
} from "@/data/notificacoes";

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const [member, role] = await Promise.all([
    getMemberByUserId(auth.orgId, auth.user.id),
    getActiveRole(),
  ]);
  const grau = (member?.grau ?? "1") as "1" | "2" | "3";

  const contagem = req.nextUrl.searchParams.get("contagem");
  if (contagem === "true") {
    const count = await getUnreadCount(auth.orgId, auth.user.id, grau, role ?? "member");
    return NextResponse.json({ count });
  }

  const notifications = await getActiveNotifications(auth.orgId, grau, role ?? "member");
  return NextResponse.json(notifications);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const admin = await isLuz();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
  }

  const body = await req.json();
  const notification = await createNotification({
    organizationId: auth.orgId,
    titulo: body.titulo,
    corpo: body.corpo,
    publicoAlvo: body.publicoAlvo,
    expiraEm: body.expiraEm ? new Date(body.expiraEm) : undefined,
    enviarEmail: body.enviarEmail,
    criadoPor: auth.user.id,
  });

  return NextResponse.json(notification, { status: 201 });
}
