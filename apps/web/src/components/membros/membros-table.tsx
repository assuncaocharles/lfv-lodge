"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DegreeBadge } from "./degree-badge";
import { CARGO_LABELS } from "@/lib/constants";

interface Member {
  id: string;
  userId: string;
  grau: string;
  cargo: string | null;
  userName: string;
  userEmail: string;
  userImage: string | null;
  role: string;
  ativo: boolean;
}

export function MembrosTable({ members }: { members: Member[] }) {
  if (members.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-[13px] text-neutral-400 shadow-card">
        Nenhum membro encontrado
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white shadow-card overflow-hidden animate-fade-up">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-neutral-100 text-left">
              <th className="px-5 py-3.5 font-semibold text-neutral-400 text-[11px] uppercase tracking-wider">Membro</th>
              <th className="px-5 py-3.5 font-semibold text-neutral-400 text-[11px] uppercase tracking-wider">Grau</th>
              <th className="px-5 py-3.5 font-semibold text-neutral-400 text-[11px] uppercase tracking-wider hidden sm:table-cell">Cargo</th>
              <th className="px-5 py-3.5 font-semibold text-neutral-400 text-[11px] uppercase tracking-wider hidden md:table-cell">Perfil</th>
              <th className="px-5 py-3.5 font-semibold text-neutral-400 text-[11px] uppercase tracking-wider hidden md:table-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr
                key={m.id}
                className="border-b border-neutral-100/60 last:border-0 hover:bg-neutral-50 transition-all duration-200"
              >
                <td className="px-5 py-3.5">
                  <Link href={`/membros/${m.id}`} className="flex items-center gap-3 group">
                    <Avatar className="size-9 shadow-card">
                      <AvatarImage src={m.userImage ?? undefined} />
                      <AvatarFallback className="text-[11px] bg-navy-900 text-gold-300 font-semibold">
                        {m.userName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-neutral-900 truncate group-hover:text-gold-600 transition-all duration-200">
                        {m.userName}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">{m.userEmail}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <DegreeBadge grau={m.grau} />
                </td>
                <td className="px-5 py-3.5 hidden sm:table-cell text-neutral-600">
                  {m.cargo ? CARGO_LABELS[m.cargo] ?? m.cargo : "\u2014"}
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <span className={m.role === "owner" || m.role === "admin"
                    ? "inline-flex items-center rounded-lg bg-gold-50 px-2.5 py-1 text-[11px] font-semibold text-gold-700"
                    : "text-neutral-500 text-[13px]"
                  }>
                    {m.role === "owner" || m.role === "admin" ? "Luz" : "Membro"}
                  </span>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${m.ativo ? "text-green-600" : "text-red-500"}`}>
                    <span className={`size-1.5 rounded-full ${m.ativo ? "bg-green-500" : "bg-red-400"}`} />
                    {m.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
