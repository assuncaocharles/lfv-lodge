import { withAuth } from "@/lib/with-auth";
import { getAssignments } from "@/data/trabalhos";
import { getOrgMembers } from "@/data/membros";
import { AssignmentList } from "@/components/trabalhos/assignment-list";

async function TrabalhosPage({
  user,
  orgId,
  member,
}: {
  user: { id: string; name: string };
  orgId: string;
  member: { grau: string; role: string; profileId: string | null; isAdmin: boolean };
}) {
  const [assignments, members] = await Promise.all([
    member.isAdmin ? getAssignments(orgId) : getAssignments(orgId, user.id),
    member.isAdmin ? getOrgMembers(orgId) : Promise.resolve([]),
  ]);

  const memberOptions = members.map((m) => ({
    userId: m.userId,
    userName: m.userName,
  }));

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 tracking-tight">
          Trabalhos
        </h1>
        <p className="text-[13px] text-neutral-500 mt-1">
          Preleções, teses e pesquisas
        </p>
      </div>
      <AssignmentList
        assignments={assignments as any}
        members={memberOptions}
        isAdmin={member.isAdmin}
      />
    </div>
  );
}

export default withAuth(TrabalhosPage);
