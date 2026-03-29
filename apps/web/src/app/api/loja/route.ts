import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import { getLojaInfo, upsertLojaInfo } from "@/data/loja";

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const info = await getLojaInfo(auth.orgId);
  return NextResponse.json(info ?? {});
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const admin = await isLuz();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
  }

  const body = await req.json();
  const info = await upsertLojaInfo(auth.orgId, body);
  return NextResponse.json(info);
}
