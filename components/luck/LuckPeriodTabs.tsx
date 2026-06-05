"use client";

import { cn } from "@/lib/utils";
import type { LuckPeriod } from "@/lib/fortune/luck";

const TABS: { id: LuckPeriod; label: string }[] = [
  { id: "day", label: "日" },
  { id: "week", label: "周" },
  { id: "month", label: "月" },
  { id: "year", label: "年" },
];

export function LuckPeriodTabs({
  value,
  onChange,
}: {
  value: LuckPeriod;
  onChange: (p: LuckPeriod) => void;
}) {
  return (
    <div className="-mx-1 flex items-center gap-1 overflow-x-auto border-b border-[var(--border-soft)] px-1 pb-3 scrollbar-none">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative shrink-0 px-4 py-2 text-sm font-medium transition-colors min-h-[44px]",
            value === tab.id
              ? "text-[var(--gold-main)]"
              : "text-[var(--text-dim)] hover:text-[var(--text-muted)]",
          )}
        >
          {tab.label}
          {value === tab.id && (
            <span className="absolute inset-x-2 -bottom-3 h-0.5 rounded-full bg-gradient-to-r from-[var(--purple-deep)] to-[var(--gold-main)]" />
          )}
        </button>
      ))}
    </div>
  );
}
