"use client";

import { useState } from "react";
import Link from "next/link";

import { usePathname } from "next/navigation";
import { Menu } from "iconoir-react";
import { NAV_ITEMS, getPageTitle } from "@/lib/navigation";
import { useMember } from "@/hooks/use-member";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { member } = useMember();
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || member.isAdmin,
  );
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="flex h-[72px] items-center justify-between px-4 md:px-8 bg-[var(--app-header-bg)] glass border-b border-[var(--app-border)]">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-xl"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[280px] bg-[var(--app-card)] p-0 border-[var(--app-border)]"
          >
            {/* Mobile sidebar */}
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl shadow-card overflow-hidden">
                  <img
                    src="/logo-small.png"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="font-display text-sm font-semibold text-[var(--app-card-fg)]">
                    LFV 003
                  </h1>
                </div>
              </div>
            </div>
            <nav className="flex flex-col gap-1 px-3">
              {visibleItems.map(({ label, href, icon: Icon }) => {
                const isActive =
                  href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                      isActive
                        ? "bg-neutral-900 text-white dark:bg-white/10"
                        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/5",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[18px]",
                        isActive
                          ? "text-white"
                          : "text-neutral-400",
                      )}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Mobile title */}
        <span className="font-display text-sm font-semibold md:hidden text-neutral-900">
          {pageTitle}
        </span>

        {/* Desktop breadcrumb */}
        <div className="hidden md:flex items-center gap-2">
          <h2 className="font-display text-lg font-semibold text-neutral-900 tracking-tight">
            {pageTitle}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
