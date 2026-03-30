"use client";

import { useState, useCallback, useRef } from "react";
import { MembrosTable } from "./membros-table";
import { InviteDialog } from "./invite-dialog";

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

interface MembrosViewProps {
  members: Member[];
  isAdmin: boolean;
}

export function MembrosView({ members: serverMembers, isAdmin }: MembrosViewProps) {
  const [members, setMembers] = useState(serverMembers);
  const prevServerRef = useRef(serverMembers);

  // Sync local state when server data changes (after router.refresh())
  if (prevServerRef.current !== serverMembers) {
    prevServerRef.current = serverMembers;
    setMembers(serverMembers);
  }

  const handleMemberInvited = useCallback(
    (invited: { email: string; grau: string; cargo: string | null; role: string }) => {
      const placeholder: Member = {
        id: `pending-${Date.now()}`,
        userId: "",
        grau: invited.grau,
        cargo: invited.cargo,
        userName: invited.email.split("@")[0],
        userEmail: invited.email,
        userImage: null,
        role: invited.role,
        ativo: true,
      };
      setMembers((prev) => [...prev, placeholder]);
    },
    []
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-900 tracking-tight">
            Membros
          </h1>
          <p className="text-[13px] text-neutral-500 mt-1">
            {members.length} membro{members.length !== 1 ? "s" : ""} na loja
          </p>
        </div>
        {isAdmin && <InviteDialog onSuccess={handleMemberInvited} />}
      </div>
      <MembrosTable members={members} />
    </>
  );
}
