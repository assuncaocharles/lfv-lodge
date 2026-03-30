import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import { getMemberByUserId } from "@/data/membros";
import {
  getFolderContents,
  getBreadcrumbs,
  getDocumentById,
  createFolder,
} from "@/data/documentos";

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const member = await getMemberByUserId(auth.orgId, auth.user.id);
  const grau = (member?.grau ?? "1") as "1" | "2" | "3";
  const pastaId = req.nextUrl.searchParams.get("pastaId");

  const [items, breadcrumbs, currentFolder] = await Promise.all([
    getFolderContents(auth.orgId, pastaId, grau),
    pastaId ? getBreadcrumbs(pastaId) : [],
    pastaId ? getDocumentById(auth.orgId, pastaId) : null,
  ]);

  return NextResponse.json({
    items,
    breadcrumbs,
    currentFolderGrau: currentFolder?.grauMinimo ?? null,
  });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const admin = await isLuz();
  if (!admin) {
    return NextResponse.json({ error: "Acesso restrito" }, { status: 403 });
  }

  const body = await req.json();
  const folder = await createFolder({
    organizationId: auth.orgId,
    nome: body.nome,
    pastaPaiId: body.pastaPaiId ?? null,
    grauMinimo: body.grauMinimo ?? "1",
    criadoPor: auth.user.id,
  });

  return NextResponse.json(folder, { status: 201 });
}
