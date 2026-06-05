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
    <div className="flex items-center gap-1 border-b border-[var(--border-soft)] pb-3">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative px-4 py-1.5 text-sm font-medium transition-colors",
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
