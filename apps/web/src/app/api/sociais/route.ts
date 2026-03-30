import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import { getSocialLinks, createSocialLink } from "@/data/sociais";

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const links = await getSocialLinks(auth.orgId);
  return NextResponse.json(links);
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
  const link = await createSocialLink({
    organizationId: auth.orgId,
    plataforma: body.plataforma,
    titulo: body.titulo,
    url: body.url,
    icone: body.icone,
    ordem: body.ordem,
  });

  return NextResponse.json(link, { status: 201 });
}
