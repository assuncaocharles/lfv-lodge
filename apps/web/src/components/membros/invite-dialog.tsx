"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GRAU_LABELS, CARGO_LABELS } from "@/lib/constants";

export function InviteDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [grau, setGrau] = useState("1");
  const [cargo, setCargo] = useState<string>("");
  const [role, setRole] = useState("member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await authClient.organization.inviteMember({
        email,
        role: role as "member" | "admin",
      });
      setOpen(false);
      setEmail("");
      setGrau("1");
      setCargo("");
      setRole("member");
      router.refresh();
    } catch {
      setError("Erro ao enviar convite. Verifique o email e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl transition-all duration-200 font-semibold text-[13px]">
          Convidar Membro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-neutral-900 tracking-tight">
            Convidar Membro
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[13px] font-medium text-neutral-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="membro@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl text-[13px]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-neutral-700">Perfil</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="rounded-xl text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="member" className="text-[13px]">Membro</SelectItem>
                <SelectItem value="admin" className="text-[13px]">Luz (Administrador)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-neutral-700">Grau</Label>
            <Select value={grau} onValueChange={setGrau}>
              <SelectTrigger className="rounded-xl text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {Object.entries(GRAU_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-[13px]">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {grau === "3" && (
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-neutral-700">Cargo (opcional)</Label>
              <Select value={cargo} onValueChange={setCargo}>
                <SelectTrigger className="rounded-xl text-[13px]">
                  <SelectValue placeholder="Selecionar cargo" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="" className="text-[13px]">Nenhum</SelectItem>
                  {Object.entries(CARGO_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-[13px]">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {error && <p className="text-[13px] text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl text-[13px] transition-all duration-200"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl transition-all duration-200 font-semibold text-[13px]"
            >
              {isSubmitting ? "Enviando..." : "Enviar Convite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
