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

export const NAV_ITEMS = [
  { label: "Início", href: "/", icon: Home },
  { label: "Membros", href: "/membros", icon: Group },
  { label: "Documentos", href: "/documentos", icon: Folder },
  { label: "Calendário", href: "/calendario", icon: Calendar },
  { label: "Notificações", href: "/notificacoes", icon: Bell },
  { label: "Trabalhos", href: "/trabalhos", icon: TaskList },
  { label: "Loja", href: "/loja", icon: Building },
  { label: "Sociais", href: "/sociais", icon: ShareAndroid },
] as const;

export const PAGE_TITLES: Record<string, string> = {
  "/": "Início",
  "/membros": "Membros",
  "/documentos": "Documentos",
  "/calendario": "Calendário",
  "/notificacoes": "Notificações",
  "/trabalhos": "Trabalhos",
  "/loja": "Loja",
  "/sociais": "Sociais",
  "/perfil": "Meu Perfil",
};

export function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Início";
  const base = "/" + pathname.split("/")[1];
  return PAGE_TITLES[base] ?? "";
}
