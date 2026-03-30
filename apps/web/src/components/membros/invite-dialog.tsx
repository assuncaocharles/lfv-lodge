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
  const [password, setPassword] = useState("");
  const [grau, setGrau] = useState("1");
  const [cargo, setCargo] = useState<string>("none");
  const [role, setRole] = useState("member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create the user account with default password first
      const res = await fetch("/api/membros/convidar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role: role as "member" | "admin",
          grau,
          cargo: cargo && cargo !== "none" ? cargo : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao convidar");
      }

      setOpen(false);
      setEmail("");
      setPassword("");
      setGrau("1");
      setCargo("none");
      setRole("member");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao enviar convite. Verifique o email e tente novamente."
      );
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
            <Label
              htmlFor="invite-email"
              className="text-[13px] font-medium text-neutral-700"
            >
              Email
            </Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="membro@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl text-[13px]"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="invite-password"
              className="text-[13px] font-medium text-neutral-700"
            >
              Senha inicial
            </Label>
            <Input
              id="invite-password"
              type="text"
              placeholder="Senha padrão para o membro"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xl text-[13px]"
            />
            <p className="text-[11px] text-neutral-400">
              O membro poderá alterar depois no perfil
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-neutral-700">
              Perfil
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="rounded-xl text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="member" className="text-[13px]">
                  Membro
                </SelectItem>
                <SelectItem value="admin" className="text-[13px]">
                  Luz (Administrador)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-neutral-700">
              Grau
            </Label>
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
              <Label className="text-[13px] font-medium text-neutral-700">
                Cargo (opcional)
              </Label>
              <Select value={cargo} onValueChange={setCargo}>
                <SelectTrigger className="rounded-xl text-[13px]">
                  <SelectValue placeholder="Selecionar cargo" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none" className="text-[13px]">
                    Nenhum
                  </SelectItem>
                  {Object.entries(CARGO_LABELS).map(([value, label]) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="text-[13px]"
                    >
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
              {isSubmitting ? "Criando..." : "Criar Membro"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
