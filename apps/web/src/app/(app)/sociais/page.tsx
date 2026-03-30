"use client";

import { useMember } from "@/hooks/use-member";
import { useFetch } from "@/hooks/use-fetch";
import { SocialLinksGrid } from "@/components/sociais/social-links-grid";

interface SocialLink {
  id: string;
  plataforma: string;
  titulo: string;
  url: string;
}

export default function SociaisPage() {
  const { member } = useMember();
  const { data: links, isLoading } = useFetch<SocialLink[]>("/api/sociais");

  if (isLoading) {
    return (
      <div className="animate-fade-up space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 tracking-tight">
            Redes Sociais
          </h1>
          <p className="text-[13px] text-neutral-500 mt-1">
            Links e grupos da loja
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-[13px] text-neutral-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-900 tracking-tight">
          Redes Sociais
        </h1>
        <p className="text-[13px] text-neutral-500 mt-1">
          Links e grupos da loja
        </p>
      </div>
      <SocialLinksGrid links={links ?? []} isAdmin={member.isAdmin} />
    </div>
  );
}
