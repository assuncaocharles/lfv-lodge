"use client";

import { useMember } from "@/hooks/use-member";
import { useFetch } from "@/hooks/use-fetch";
import { ProfileForm } from "@/components/perfil/profile-form";

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  member: {
    profileId: string | null;
    grau: string;
    role: string;
    isAdmin: boolean;
    telefone: string | null;
    cargo: string | null;
  } | null;
}

export default function PerfilPage() {
  const { user } = useMember();
  const { data, isLoading } = useFetch<ProfileData>("/api/perfil");

  if (isLoading) {
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
        <div className="flex items-center justify-center py-12">
          <p className="text-[13px] text-neutral-400">Carregando...</p>
        </div>
      </div>
    );
  }

  const profileUser = data?.user ?? {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  };

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
        user={profileUser}
        profile={
          data?.member
            ? {
                telefone: data.member.telefone,
                grau: data.member.grau,
                cargo: data.member.cargo,
              }
            : null
        }
      />
    </div>
  );
}
