"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { LogOut, User } from "iconoir-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const user = session?.user;
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 rounded-xl px-2.5 py-2 outline-none hover:bg-[var(--app-muted)] transition-all duration-200">
        <Avatar className="size-9 ring-2 ring-neutral-200/50 dark:ring-white/10">
          <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
          <AvatarFallback className="text-xs bg-navy-900 text-white font-semibold">
            {initials ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:block text-left">
          <p className="text-[13px] font-semibold text-[var(--app-card-fg)] leading-tight">
            {user?.name}
          </p>
          <p className="text-[11px] text-neutral-400">{user?.email}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 rounded-xl shadow-elevated border-[var(--app-border)]"
      >
        <DropdownMenuItem asChild className="rounded-lg text-[13px] gap-2">
          <Link href="/perfil">
            <User className="size-4" strokeWidth={1.7} />
            Meu Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="rounded-lg text-[13px] gap-2 text-red-500 focus:text-red-500"
        >
          <LogOut className="size-4" strokeWidth={1.7} />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
