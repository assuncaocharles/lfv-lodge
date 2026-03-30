"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function SolicitarAcessoPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [mensagem, setMensagem] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "sent" | "already_sent" | "error"
  >("idle");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch("/api/solicitar-acesso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: mensagem || undefined }),
      });

      if (res.ok) {
        const data = await res.json();
        setStatus(data.existing ? "already_sent" : "sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  if (isPending) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--app-bg)]">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-[var(--app-bg)]">
      <div className="w-full max-w-md animate-fade-up">
        <div className="bg-[var(--app-card)] rounded-2xl shadow-card p-8">
          {status === "sent" || status === "already_sent" ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center mx-auto">
                <svg
                  className="size-7 text-teal-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h1 className="font-display text-xl font-bold tracking-tight">
                  Solicitação Enviada
                </h1>
                <p className="text-[13px] text-neutral-500 mt-2">
                  {status === "already_sent"
                    ? "Você já possui uma solicitação pendente. Aguarde a aprovação de um administrador."
                    : "Sua solicitação foi enviada. Um administrador irá analisá-la em breve."}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="rounded-xl text-[13px]"
              >
                Voltar ao Login
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-4">
                  <img
                    src="/logo-small.png"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="font-display text-xl font-bold tracking-tight">
                  Solicitar Acesso
                </h1>
                <p className="text-[13px] text-neutral-500 mt-2">
                  Você está autenticado como{" "}
                  <strong>{session.user.email}</strong>, mas ainda não é membro
                  da loja. Solicite acesso abaixo.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-neutral-600">
                    Mensagem (opcional)
                  </Label>
                  <Textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Diga ao administrador quem você é..."
                    rows={3}
                    disabled={status === "submitting"}
                    className="rounded-xl bg-neutral-50 border-neutral-200 text-[13px] dark:bg-white/5 dark:border-white/10"
                  />
                </div>

                {status === "error" && (
                  <p className="text-[13px] text-red-500">
                    Erro ao enviar solicitação. Tente novamente.
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full rounded-xl h-11"
                >
                  {status === "submitting"
                    ? "Enviando..."
                    : "Solicitar Acesso"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={handleSignOut}
                  className="text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  Entrar com outra conta
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
