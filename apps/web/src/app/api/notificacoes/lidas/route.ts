import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-utils";
import { markMultipleAsRead } from "@/data/notificacoes";

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { ids } = await req.json();
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "IDs invalidos" }, { status: 400 });
  }

  await markMultipleAsRead(ids, auth.user.id);
  return NextResponse.json({ success: true });
}
