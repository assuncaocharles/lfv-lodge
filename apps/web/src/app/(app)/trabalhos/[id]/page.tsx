"use client";

import { useParams } from "next/navigation";
import { useMember } from "@/hooks/use-member";
import { useFetch } from "@/hooks/use-fetch";
import { Badge } from "@/components/ui/badge";
import { AssignmentActions } from "@/components/trabalhos/assignment-actions";

const STATUS_LABELS: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  enviado: "Enviado",
  aprovado: "Aprovado",
  recusado: "Recusado",
};

const STATUS_COLORS: Record<string, string> = {
  pendente: "bg-amber-50 text-amber-600",
  em_andamento: "bg-blue-50 text-blue-600",
  enviado: "bg-violet-50 text-violet-600",
  aprovado: "bg-teal-50 text-teal-600",
  recusado: "bg-red-50 text-red-600",
};

interface Assignment {
  id: string;
  titulo: string;
  descricao: string | null;
  prazo: string | null;
  status: string;
  atribuidoA: string;
  atribuidoANome: string;
  feedbackAdmin: string | null;
  createdAt: string;
}

// NOTE: The /api/trabalhos/[id] route does not return submissions.
// A GET endpoint for /api/trabalhos/[id]/envio would need to be created
// to fetch submissions client-side. For now, the submissions section
// is rendered but will always show empty until that API is added.
interface Submission {
  id: string;
  nomeArquivo: string;
  userName: string;
  createdAt: string;
  tamanho: number | null;
  comentario: string | null;
}

export default function TrabalhoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, member } = useMember();
  const { data: assignment, isLoading } = useFetch<Assignment>(
    `/api/trabalhos/${id}`,
  );
  // TODO: Add GET /api/trabalhos/[id]/envio endpoint to support client-side submissions fetching
  const { data: submissions } = useFetch<Submission[]>(
    `/api/trabalhos/${id}/envio`,
  );

  const admin = member.isAdmin;

  if (isLoading) {
    return (
      <div className="animate-fade-up space-y-6 max-w-2xl">
        <div className="flex items-center justify-center py-12">
          <p className="text-[13px] text-neutral-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="animate-fade-up space-y-6 max-w-2xl">
        <p className="text-[13px] text-neutral-400">
          Trabalho não encontrado
        </p>
      </div>
    );
  }

  const isAssignee = assignment.atribuidoA === user.id;
  const subs = submissions ?? [];

  return (
    <div className="animate-fade-up space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-neutral-900 tracking-tight">
            {assignment.titulo}
          </h1>
          <Badge
            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border-0 ${STATUS_COLORS[assignment.status] ?? ""}`}
          >
            {STATUS_LABELS[assignment.status] ?? assignment.status}
          </Badge>
        </div>
        <p className="text-[13px] text-neutral-500 mt-1">
          Atribuido a {assignment.atribuidoANome}
          {assignment.prazo && (
            <> · Prazo: {new Date(assignment.prazo).toLocaleDateString("pt-BR")}</>
          )}
        </p>
      </div>

      {assignment.descricao && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-[15px] font-semibold text-neutral-900 tracking-tight">
            Descrição
          </h2>
          <p className="text-[13px] text-neutral-500 mt-2 whitespace-pre-wrap">
            {assignment.descricao}
          </p>
        </div>
      )}

      {assignment.feedbackAdmin && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-display text-[15px] font-semibold text-neutral-900 tracking-tight">
            Feedback do Administrador
          </h2>
          <p className="text-[13px] text-neutral-500 mt-2 whitespace-pre-wrap">
            {assignment.feedbackAdmin}
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="font-display text-[15px] font-semibold text-neutral-900 tracking-tight">
          Envios ({subs.length})
        </h2>
        <div className="mt-3">
          {subs.length === 0 ? (
            <p className="text-[13px] text-neutral-400">Nenhum envio ainda</p>
          ) : (
            <div className="space-y-2">
              {subs.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-100 p-3 transition-all duration-200 hover:bg-neutral-50"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-neutral-800 truncate">
                      {s.nomeArquivo}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {s.userName} · {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                      {s.tamanho && ` · ${(s.tamanho / 1024).toFixed(0)} KB`}
                    </p>
                    {s.comentario && (
                      <p className="text-[11px] text-neutral-500 mt-1">{s.comentario}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AssignmentActions
        assignmentId={id}
        status={assignment.status}
        isAdmin={admin}
        isAssignee={isAssignee}
      />
    </div>
  );
}
