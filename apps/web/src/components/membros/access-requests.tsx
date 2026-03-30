"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Xmark } from "iconoir-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GRAU_LABELS } from "@/lib/constants";

interface AccessRequest {
  id: string;
  userId: string;
  mensagem: string | null;
  createdAt: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
}

export function AccessRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [grauMap, setGrauMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/solicitar-acesso")
      .then((r) => r.json())
      .then((data) => {
        setRequests(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleResolve(
    requestId: string,
    status: "aprovado" | "recusado"
  ) {
    // Optimistic: remove from list
    setRequests((prev) => prev.filter((r) => r.id !== requestId));

    await fetch("/api/solicitar-acesso", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestId,
        status,
        grau: grauMap[requestId] ?? "1",
      }),
    });
    router.refresh();
  }

  if (loading) return null;
  if (requests.length === 0) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-500/5 rounded-2xl shadow-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-amber-200/50 dark:border-amber-500/10">
        <h3 className="font-display text-[14px] font-semibold text-amber-800 dark:text-amber-400">
          Solicitações de Acesso ({requests.length})
        </h3>
      </div>
      <div className="divide-y divide-amber-200/30 dark:divide-amber-500/10">
        {requests.map((req) => {
          const initials = req.userName
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div key={req.id} className="px-5 py-4 flex items-start gap-3">
              <Avatar className="size-9 shrink-0">
                <AvatarImage src={req.userImage ?? undefined} />
                <AvatarFallback className="text-[11px] bg-amber-100 text-amber-700 font-semibold dark:bg-amber-500/10">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
                  {req.userName}
                </p>
                <p className="text-[12px] text-neutral-500">{req.userEmail}</p>
                {req.mensagem && (
                  <p className="text-[12px] text-neutral-600 dark:text-neutral-400 mt-1 italic">
                    &ldquo;{req.mensagem}&rdquo;
                  </p>
                )}
                <p className="text-[11px] text-neutral-400 mt-1">
                  {new Date(req.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Select
                  value={grauMap[req.id] ?? "1"}
                  onValueChange={(v) =>
                    setGrauMap((prev) => ({ ...prev, [req.id]: v }))
                  }
                >
                  <SelectTrigger className="w-[130px] h-8 rounded-lg text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GRAU_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v} className="text-[12px]">
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 rounded-lg text-teal-600 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-500/10"
                  onClick={() => handleResolve(req.id, "aprovado")}
                >
                  <Check className="size-4" strokeWidth={2} />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                  onClick={() => handleResolve(req.id, "recusado")}
                >
                  <Xmark className="size-4" strokeWidth={2} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
