"use client";

import { TAROT_SPREADS } from "@/lib/fortune/tarot";
import { cn } from "@/lib/utils";

export function TarotSpreadSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (spreadId: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {TAROT_SPREADS.map((spread) => {
        const active = value === spread.id;
        return (
          <button
            key={spread.id}
            type="button"
            onClick={() => onChange(spread.id)}
            className={cn(
              "min-h-[64px] rounded-xl border px-3 py-2 text-left transition-colors",
              active
                ? "border-[var(--gold-main)]/50 bg-[rgba(139,92,246,0.12)] text-[var(--gold-main)]"
                : "border-[var(--border-soft)] text-[var(--text-muted)] hover:border-[var(--purple-primary)]/40",
            )}
          >
            <span className="block text-sm font-medium">{spread.name}</span>
            <span className="mt-1 block text-xs leading-5 text-[var(--text-dim)]">
              {spread.count} 张 · {spread.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
