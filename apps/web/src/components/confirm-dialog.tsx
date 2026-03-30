"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmingLabel?: string;
  onConfirm: () => Promise<void>;
  variant?: "destructive" | "default";
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  confirmingLabel = "Aguarde...",
  onConfirm,
  variant = "destructive",
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && setOpen(v)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold tracking-tight">
            {title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-[13px] text-neutral-500">{description}</p>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
            className="rounded-xl text-[13px]"
          >
            Cancelar
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={pending}
            className="rounded-xl text-[13px]"
          >
            {pending ? confirmingLabel : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
