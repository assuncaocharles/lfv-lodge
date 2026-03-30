"use client";

import { useMember } from "@/hooks/use-member";
import { useFetch } from "@/hooks/use-fetch";
import { MembrosView } from "@/components/membros/membros-view";
import { AccessRequests } from "@/components/membros/access-requests";

export default function MembrosPage() {
  const { member } = useMember();
  const { data: members, error, isLoading } = useFetch<any[]>("/api/membros");

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-2xl shadow-card h-16" />
          <div className="bg-white rounded-2xl shadow-card h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 rounded-2xl p-6 text-[13px]">
        Erro ao carregar membros: {error.message}
      </div>
    );
  }

  if (!members) return null;

  return (
    <div className="space-y-6 animate-fade-up">
      {member.isAdmin && <AccessRequests />}
      <MembrosView members={members} isAdmin={member.isAdmin} />
    </div>
  );
}
