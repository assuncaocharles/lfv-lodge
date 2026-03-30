import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAuthenticatedUser } from "@/lib/api-utils";
import { getMemberByUserId } from "@/data/membros";
import { createFeedToken } from "@/lib/feed-token";

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const member = await getMemberByUserId(auth.orgId, auth.user.id);
  const grau = (member?.grau ?? "1") as "1" | "2" | "3";

  const feedToken = createFeedToken(auth.user.id, auth.orgId, grau);

  const reqHeaders = await headers();
  const host = reqHeaders.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const feedUrl = `${protocol}://${host}/api/eventos/feed/${feedToken}`;

  return NextResponse.json({ feedUrl });
}
