"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { MemberProvider } from "@/hooks/use-member";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  member: {
    profileId: string;
    grau: "1" | "2" | "3";
    role: string;
    isAdmin: boolean;
    telefone: string | null;
    cargo: string | null;
  } | null;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [status, setStatus] = useState<"loading" | "authorized" | "redirecting">("loading");

  useEffect(() => {
    // Wait for session to load
    if (sessionPending) return;

    // No session → login
    if (!session) {
      setStatus("redirecting");
      window.location.href = "/login";
      return;
    }

    // Fetch membership info
    fetch("/api/perfil")
      .then((res) => {
        if (!res.ok) {
          // API returned error (e.g. no orgId set yet) → not a member
          setStatus("redirecting");
          window.location.href = "/solicitar-acesso";
          return null;
        }
        return res.json();
      })
      .then((data: ProfileData | null) => {
        if (!data) return;

        if (!data.member) {
          // Authenticated but not a member
          setStatus("redirecting");
          window.location.href = "/solicitar-acesso";
          return;
        }

        setProfile(data);
        setStatus("authorized");
      })
      .catch(() => {
        setStatus("redirecting");
        window.location.href = "/login";
      });
  }, [session, sessionPending]);

  // Loading state — show spinner
  if (status === "loading" || status === "redirecting") {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--app-bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin dark:border-white/10 dark:border-t-white" />
          {status === "redirecting" && (
            <p className="text-[13px] text-neutral-400">Redirecionando...</p>
          )}
        </div>
      </div>
    );
  }

  // Should never happen, but safety check
  if (!profile?.member) return null;

  return (
    <MemberProvider user={profile.user} member={profile.member}>
      <div className="flex h-full">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-auto p-5 md:p-8 bg-[var(--app-bg)]">
            {children}
          </main>
        </div>
      </div>
    </MemberProvider>
  );
}
