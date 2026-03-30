import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-utils";
import { getAssignmentById, getSubmissions, createSubmission } from "@/data/trabalhos";
import { uploadFile } from "@/lib/s3";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const submissions = await getSubmissions(id);
  return NextResponse.json(submissions);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const assignment = await getAssignmentById(auth.orgId, id);
  if (!assignment) {
    return NextResponse.json({ error: "Trabalho não encontrado" }, { status: 404 });
  }

  if (assignment.atribuidoA !== auth.user.id) {
    return NextResponse.json({ error: "Apenas o membro atribuído pode enviar" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const comentario = formData.get("comentario") as string | null;

  if (!file) {
    return NextResponse.json({ error: "Arquivo é obrigatório" }, { status: 400 });
  }

  const storageKey = `envios/${auth.orgId}/${id}/${crypto.randomUUID()}/${file.name}`;

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

  const submission = await createSubmission({
    trabalhoId: id,
    userId: auth.user.id,
    storageKey,
    nomeArquivo: file.name,
    mimeType: file.type,
    tamanho: file.size,
    comentario: comentario || undefined,
  });

  return NextResponse.json({ submission }, { status: 201 });
}
