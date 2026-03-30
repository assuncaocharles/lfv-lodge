import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import { createDocument } from "@/data/documentos";
import { uploadFile } from "@/lib/s3";

function getDocType(
  mimeType: string
): "pdf" | "ppt" | "doc" | "image" | "other" {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "ppt";
  if (mimeType.includes("document") || mimeType.includes("msword"))
    return "doc";
  if (mimeType.startsWith("image/")) return "image";
  return "other";
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

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const nome = formData.get("nome") as string;
  const pastaPaiId = formData.get("pastaPaiId") as string | null;
  const grauMinimo = (formData.get("grauMinimo") as string) || "1";

  if (!file || !nome) {
    return NextResponse.json(
      { error: "Arquivo e nome são obrigatórios" },
      { status: 400 }
    );
  }

  const storageKey = `docs/${auth.orgId}/${crypto.randomUUID()}/${nome}`;

  // Upload to R2 first — if this fails, no DB record is created
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadFile(storageKey, buffer, file.type);
  } catch (err) {
    console.error("Erro ao enviar para R2:", err);
    return NextResponse.json(
      { error: "Erro ao enviar arquivo. Tente novamente." },
      { status: 500 }
    );
  }

  // Only create DB record after successful upload
  const doc = await createDocument({
    organizationId: auth.orgId,
    nome,
    pastaPaiId: pastaPaiId || null,
    tipo: getDocType(file.type),
    storageKey,
    mimeType: file.type,
    tamanho: file.size,
    grauMinimo: grauMinimo as "1" | "2" | "3",
    criadoPor: auth.user.id,
  });

  return NextResponse.json({ doc }, { status: 201 });
}
