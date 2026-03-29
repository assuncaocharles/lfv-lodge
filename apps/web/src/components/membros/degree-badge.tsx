import { GRAU_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const grauVariants: Record<string, string> = {
  "1": "bg-blue-50 text-blue-700 ring-1 ring-blue-200/50",
  "2": "bg-gold-50 text-gold-700 ring-1 ring-gold-200/50",
  "3": "bg-violet-50 text-violet-700 ring-1 ring-violet-200/50",
};

export function DegreeBadge({ grau }: { grau: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all duration-200",
        grauVariants[grau] ?? "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200/50",
      )}
    >
      {GRAU_LABELS[grau] ?? `Grau ${grau}`}
    </span>
  );
}
