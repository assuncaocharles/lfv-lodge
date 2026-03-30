"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "iconoir-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteMemberButton({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/membros/${memberId}`, { method: "DELETE" });
      setOpen(false);
      // Revalidate then navigate so the list is fresh
      router.refresh();
      await new Promise((r) => setTimeout(r, 500));
      router.push("/membros");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-[13px] gap-1.5"
        >
          <Trash className="size-4" strokeWidth={1.7} />
          Remover Membro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-neutral-900 tracking-tight">
            Remover Membro
          </DialogTitle>
        </DialogHeader>
        <p className="text-[13px] text-neutral-500">
          Tem certeza que deseja remover <strong>{memberName}</strong> da loja?
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-xl text-[13px]"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl text-[13px]"
          >
            {deleting ? "Removendo..." : "Remover"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
