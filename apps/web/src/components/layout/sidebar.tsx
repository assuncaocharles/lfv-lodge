"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";
import {
  Home,
  Group,
  Folder,
  Calendar,
  Bell,
  TaskList,
  Building,
  ShareAndroid,
} from "iconoir-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Início", href: "/", icon: Home },
  { label: "Membros", href: "/membros", icon: Group },
  { label: "Documentos", href: "/documentos", icon: Folder },
  { label: "Calendário", href: "/calendario", icon: Calendar },
  { label: "Notificações", href: "/notificacoes", icon: Bell },
  { label: "Trabalhos", href: "/trabalhos", icon: TaskList },
  { label: "Loja", href: "/loja", icon: Building },
  { label: "Sociais", href: "/sociais", icon: ShareAndroid },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-[260px] shrink-0 flex-col bg-[var(--app-card)] border-r border-[var(--app-border)]">
      {/* Logo */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl shadow-card overflow-hidden shrink-0">
            <img
              src="/logo.png"
              alt="Labor, Força e Virtude"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-[15px] font-semibold text-[var(--app-card-fg)] leading-tight">
              Labor, Força e Virtude
            </h1>
            <p className="text-[11px] text-neutral-400 font-medium">N.o 003</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          Menu
        </p>
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-neutral-900 text-white shadow-nav-active dark:bg-white/10 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/5",
              )}
            >
              <Icon
                className={cn(
                  "size-[18px] transition-colors duration-200",
                  isActive
                    ? "text-white"
                    : "text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-white",
                )}
                strokeWidth={isActive ? 2 : 1.5}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4">
        <div className="rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 p-4 text-white dark:from-white/5 dark:to-white/[0.02] dark:ring-1 dark:ring-white/[0.06]">
          <p className="text-[12px] font-semibold">Sistema de Gestão</p>
          <p className="text-[11px] text-white/60 mt-0.5">v1.0 · Lodge Manager</p>
        </div>
      </div>
    </aside>
  );
}
