"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SunLight, HalfMoon } from "iconoir-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-xl size-9">
        <div className="size-[18px]" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-xl size-9"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <SunLight className="size-[18px]" strokeWidth={1.7} />
      ) : (
        <HalfMoon className="size-[18px]" strokeWidth={1.7} />
      )}
    </Button>
  );
}
