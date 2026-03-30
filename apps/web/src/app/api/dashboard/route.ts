import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-utils";
import { getMemberByUserId, getOrgMembers } from "@/data/membros";
import { getUpcomingEvents } from "@/data/eventos";
import { getUnreadCount } from "@/data/notificacoes";
import { getAssignments } from "@/data/trabalhos";

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const member = await getMemberByUserId(auth.orgId, auth.user.id);
  const grau = (member?.grau ?? "1") as "1" | "2" | "3";
  const role = "member"; // simplified for dashboard

  const [members, events, unreadCount, assignments] = await Promise.all([
    getOrgMembers(auth.orgId),
    getUpcomingEvents(auth.orgId, grau, 4),
    getUnreadCount(auth.orgId, auth.user.id, grau, role),
    getAssignments(auth.orgId, auth.user.id),
  ]);

  const activeMembers = members.filter((m) => m.ativo);
  const pendingAssignments = assignments.filter(
    (a) => a.status === "pendente" || a.status === "em_andamento"
  );

  return NextResponse.json({
    stats: {
      activeMembers: activeMembers.length,
      upcomingEvents: events.length,
      unreadNotifications: unreadCount,
      pendingAssignments: pendingAssignments.length,
    },
    events,
  });
}
