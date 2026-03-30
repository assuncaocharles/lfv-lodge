import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import { getStatusMensalidades } from "@/data/tesouraria";

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = await isLuz();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
  }

  const mes = req.nextUrl.searchParams.get("mes");
  if (!mes) {
    return NextResponse.json(
      { error: "Parâmetro obrigatório: mes" },
      { status: 400 },
    );
  }

  const status = await getStatusMensalidades(auth.orgId, mes);
  return NextResponse.json(status);
}
