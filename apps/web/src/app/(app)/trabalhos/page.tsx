import { withAuth } from "@/lib/with-auth";
import { isLuz } from "@/lib/api-utils";
import { getAssignments } from "@/data/trabalhos";
import { getOrgMembers } from "@/data/membros";
import { AssignmentList } from "@/components/trabalhos/assignment-list";

async function TrabalhosPage({
  user,
  orgId,
}: {
  user: { id: string; name: string };
  orgId: string;
}) {
  const admin = await isLuz();
  const [assignments, members] = await Promise.all([
    admin ? getAssignments(orgId) : getAssignments(orgId, user.id),
    admin ? getOrgMembers(orgId) : Promise.resolve([]),
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
        isAdmin={admin}
      />
    </div>
  );
}

export default withAuth(TrabalhosPage);
