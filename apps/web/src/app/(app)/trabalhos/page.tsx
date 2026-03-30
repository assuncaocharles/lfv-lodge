"use client";

import { useMember } from "@/hooks/use-member";
import { useFetch } from "@/hooks/use-fetch";
import { AssignmentList } from "@/components/trabalhos/assignment-list";

interface Assignment {
  id: string;
  titulo: string;
  descricao: string | null;
  prazo: string | null;
  status: string;
  atribuidoANome: string;
  createdAt: string;
}

interface MemberOption {
  userId: string;
  userName: string;
}

export default function TrabalhosPage() {
  const { member } = useMember();
  const { data: assignments, isLoading: loadingAssignments } =
    useFetch<Assignment[]>("/api/trabalhos");
  const { data: members, isLoading: loadingMembers } =
    useFetch<MemberOption[]>(member.isAdmin ? "/api/membros" : null);

  const isLoading = loadingAssignments || (member.isAdmin && loadingMembers);

  if (isLoading) {
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
          Trabalhos
        </h1>
        <p className="text-[13px] text-neutral-500 mt-1">
          Preleções, teses e pesquisas
        </p>
      </div>
      <AssignmentList
        assignments={(assignments ?? []) as any}
        members={members ?? []}
        isAdmin={member.isAdmin}
      />
    </div>
  );
}
