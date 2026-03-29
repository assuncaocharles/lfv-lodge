import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-utils";
import { getAssignmentById, createSubmission } from "@/data/trabalhos";
import { generateUploadUrl } from "@/lib/s3";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const assignment = await getAssignmentById(auth.orgId, id);
  if (!assignment) {
    return NextResponse.json({ error: "Trabalho nao encontrado" }, { status: 404 });
  }

  if (assignment.atribuidoA !== auth.user.id) {
    return NextResponse.json({ error: "Apenas o membro atribuido pode enviar" }, { status: 403 });
  }

  const body = await req.json();
  const { nomeArquivo, mimeType, tamanho, comentario } = body;

  const storageKey = `envios/${auth.orgId}/${id}/${crypto.randomUUID()}/${nomeArquivo}`;
  const uploadUrl = await generateUploadUrl(storageKey, mimeType);

  const submission = await createSubmission({
    trabalhoId: id,
    userId: auth.user.id,
    storageKey,
    nomeArquivo,
    mimeType,
    tamanho,
    comentario,
  });

  return NextResponse.json({ submission, uploadUrl }, { status: 201 });
}
