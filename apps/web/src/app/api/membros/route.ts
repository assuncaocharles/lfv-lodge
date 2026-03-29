import { NextResponse } from "next/server";
import { getAuthenticatedUser, isLuz } from "@/lib/api-utils";
import { getOrgMembers } from "@/data/membros";

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const members = await getOrgMembers(auth.orgId);
  return NextResponse.json(members);
}
