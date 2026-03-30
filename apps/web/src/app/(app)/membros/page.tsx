import { withAuth } from "@/lib/with-auth";
import { getOrgMembers } from "@/data/membros";
import { MembrosTable } from "@/components/membros/membros-table";
import { InviteDialog } from "@/components/membros/invite-dialog";

async function MembrosPage({
  user,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 tracking-tight">
            Membros
          </h1>
          <p className="text-[13px] text-neutral-500 mt-1">
            {members.length} membro{members.length !== 1 ? "s" : ""} na loja
          </p>
        </div>
        {member.isAdmin && <InviteDialog />}
      </div>
      <MembrosTable members={members} />
    </div>
  );
}

export default withAuth(MembrosPage);
