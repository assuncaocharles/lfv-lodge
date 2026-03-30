"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ConvitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [status, setStatus] = useState<"loading" | "accepting" | "error" | "success">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      router.push(`/login?redirect=/convite/${id}`);
      return;
    }

    async function acceptInvite() {
      setStatus("accepting");
      try {
        await authClient.organization.acceptInvitation({
          invitationId: id,
        });
        setStatus("success");
        router.push("/");
      } catch {
        setError("Não foi possível aceitar o convite. O convite pode ter expirado.");
        setStatus("error");
      }
    }

    acceptInvite();
  }, [session, id, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-xl">Convite</CardTitle>
          <CardDescription>
            {status === "loading" && "Verificando sessão..."}
            {status === "accepting" && "Aceitando convite..."}
            {status === "success" && "Convite aceito! Redirecionando..."}
            {status === "error" && "Erro ao aceitar convite"}
          </CardDescription>
        </CardHeader>
        {status === "error" && (
          <CardContent className="space-y-4">
            <p className="text-sm text-destructive text-center">{error}</p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Voltar ao Login
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
