"use client";

import { useRouter } from "next/navigation";
import { Trash } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useMutation } from "@/hooks/use-mutation";

export function DeleteMemberButton({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName: string;
}) {
  const router = useRouter();

  const { mutate } = useMutation({
    onSuccess: () => router.push("/membros"),
  });

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-[13px] gap-1.5"
        >
          <Trash className="size-4" strokeWidth={1.7} />
          Remover Membro
        </Button>
      }
      title="Remover Membro"
      description={`Tem certeza que deseja remover ${memberName} da loja? Esta ação não pode ser desfeita.`}
      confirmLabel="Remover"
      confirmingLabel="Removendo..."
      onConfirm={async () => {
        await mutate(() =>
          fetch(`/api/membros/${memberId}`, { method: "DELETE" })
        );
      }}
    />
  );
}
