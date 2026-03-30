import { withAuth } from "@/lib/with-auth";
import { getOrgMembers } from "@/data/membros";
import { MembrosView } from "@/components/membros/membros-view";
import { AccessRequests } from "@/components/membros/access-requests";

async function MembrosPage({
  orgId,
  member,
}: {
  user: { name: string };
  orgId: string;
  member: { grau: string; role: string; profileId: string | null; isAdmin: boolean };
}) {
  const members = await getOrgMembers(orgId);

  return (
    <div className="space-y-6 animate-fade-up">
      {member.isAdmin && <AccessRequests />}
      <MembrosView members={members} isAdmin={member.isAdmin} />
    </div>
  );
}

export default withAuth(MembrosPage);
