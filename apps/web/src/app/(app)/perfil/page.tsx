import { withAuth } from "@/lib/with-auth";
import { getMemberByUserId } from "@/data/membros";
import { ProfileForm } from "@/components/perfil/profile-form";

async function PerfilPage({
  user,
  orgId,
}: {
  user: { id: string; name: string; email: string; image?: string | null };
  orgId: string;
  member: { grau: string; role: string; profileId: string | null };
}) {
  const profile = await getMemberByUserId(orgId, user.id);

  return (
    <div className="max-w-2xl animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--app-card-fg)] tracking-tight">
          Meu Perfil
        </h1>
        <p className="text-[13px] text-neutral-500 mt-1">
          Gerencie suas informações pessoais
        </p>
      </div>

      <ProfileForm
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image ?? null,
        }}
        profile={
          profile
            ? {
                telefone: profile.telefone,
                grau: profile.grau,
                cargo: profile.cargo,
              }
            : null
        }
      />
    </div>
  );
}

export default withAuth(PerfilPage);
