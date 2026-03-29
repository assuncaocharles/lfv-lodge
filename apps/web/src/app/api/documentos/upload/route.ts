import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import { createDocument } from "@/data/documentos";
import { generateUploadUrl } from "@/lib/s3";

function getDocType(mimeType: string): "pdf" | "ppt" | "doc" | "image" | "other" {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "ppt";
  if (mimeType.includes("document") || mimeType.includes("msword")) return "doc";
  if (mimeType.startsWith("image/")) return "image";
  return "other";
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
  const { nome, mimeType, tamanho, pastaPaiId, grauMinimo } = body;

  const storageKey = `docs/${auth.orgId}/${crypto.randomUUID()}/${nome}`;
  const uploadUrl = await generateUploadUrl(storageKey, mimeType);

  const doc = await createDocument({
    organizationId: auth.orgId,
    nome,
    pastaPaiId: pastaPaiId ?? null,
    tipo: getDocType(mimeType),
    storageKey,
    mimeType,
    tamanho,
    grauMinimo: grauMinimo ?? "1",
    criadoPor: auth.user.id,
  });

  return NextResponse.json({ doc, uploadUrl }, { status: 201 });
}
