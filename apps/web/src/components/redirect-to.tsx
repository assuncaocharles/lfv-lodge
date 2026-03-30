"use client";

import { useEffect } from "react";

export function RedirectTo({ url }: { url: string }) {
  useEffect(() => {
    window.location.href = url;
  }, [url]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--app-bg)]">
      <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
    </div>
  );
}
