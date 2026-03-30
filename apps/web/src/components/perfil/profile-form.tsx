"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Lock } from "iconoir-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GRAU_LABELS, CARGO_LABELS } from "@/lib/constants";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  profile: {
    telefone: string | null;
    grau: string;
    cargo: string | null;
  } | null;
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [telefone, setTelefone] = useState(profile?.telefone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      if (name !== user.name) {
        await authClient.updateUser({ name });
      }

      await fetch("/api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefone: telefone || null }),
      });

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({
        type: "error",
        text: "A nova senha deve ter pelo menos 6 caracteres",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "As senhas não coincidem" });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      if (error) {
        setPasswordMsg({
          type: "error",
          text: error.message ?? "Erro ao alterar senha",
        });
      } else {
        setPasswordMsg({ type: "success", text: "Senha alterada com sucesso!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordMsg(null), 3000);
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Erro ao alterar senha" });
    } finally {
      setChangingPassword(false);
    }
  }

  const inputClass =
    "h-11 rounded-xl bg-neutral-50 border-neutral-200 focus:bg-white transition-colors dark:bg-white/5 dark:border-white/10 dark:focus:bg-white/10";

  return (
    <div className="space-y-6">
      {/* Profile info form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar + email */}
        <div className="bg-[var(--app-card)] rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 ring-2 ring-neutral-100">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="text-lg font-semibold bg-navy-900 text-gold-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-display text-lg font-semibold text-[var(--app-card-fg)]">
                {user.name}
              </p>
              <p className="text-[13px] text-neutral-500">{user.email}</p>
              {profile && (
                <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                  <span className="rounded-lg bg-blue-50 text-blue-600 px-2 py-0.5 font-semibold dark:bg-blue-500/10">
                    {GRAU_LABELS[profile.grau] ?? `Grau ${profile.grau}`}
                  </span>
                  {profile.cargo && (
                    <span className="rounded-lg bg-gold-50 text-gold-700 px-2 py-0.5 font-semibold dark:bg-gold-500/10">
                      {CARGO_LABELS[profile.cargo] ?? profile.cargo}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className="bg-[var(--app-card)] rounded-2xl shadow-card p-6 space-y-4">
          <h2 className="font-display text-[15px] font-semibold text-[var(--app-card-fg)] tracking-tight">
            Informações Pessoais
          </h2>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-neutral-600">
              Nome
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-neutral-600">
              Email
            </Label>
            <Input
              value={user.email}
              disabled
              className="h-11 rounded-xl bg-neutral-100 border-neutral-200 text-neutral-500 dark:bg-white/5 dark:border-white/10"
            />
            <p className="text-[11px] text-neutral-400">
              O email não pode ser alterado
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-neutral-600">
              Telefone
            </Label>
            <Input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
              className={inputClass}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl transition-all duration-200"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
            {saved && (
              <span className="text-[13px] text-teal-600 font-medium animate-fade-in">
                Salvo com sucesso!
              </span>
            )}
          </div>
        </div>
      </form>

      {/* Password change */}
      <form onSubmit={handlePasswordChange}>
        <div className="bg-[var(--app-card)] rounded-2xl shadow-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center shrink-0">
              <Lock
                className="size-[18px] text-neutral-500 dark:text-neutral-400"
                strokeWidth={1.7}
              />
            </div>
            <div>
              <h2 className="font-display text-[15px] font-semibold text-[var(--app-card-fg)] tracking-tight">
                Alterar Senha
              </h2>
              <p className="text-[11px] text-neutral-400">
                Mínimo de 6 caracteres
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium text-neutral-600">
              Senha atual
            </Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-neutral-600">
                Nova senha
              </Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px] font-medium text-neutral-600">
                Confirmar nova senha
              </Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
          </div>

          {passwordMsg && (
            <p
              className={`text-[13px] font-medium animate-fade-in ${
                passwordMsg.type === "success"
                  ? "text-teal-600"
                  : "text-red-500"
              }`}
            >
              {passwordMsg.text}
            </p>
          )}

          <div className="pt-1">
            <Button
              type="submit"
              disabled={changingPassword}
              variant="outline"
              className="rounded-xl transition-all duration-200"
            >
              {changingPassword ? "Alterando..." : "Alterar Senha"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
