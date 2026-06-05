"use client";

import { cn } from "@/lib/utils";

export function SwipeTabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none",
        className,
      )}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors min-h-[44px]",
            value === item.id
              ? "border border-[rgba(214,181,109,0.45)] bg-[rgba(139,92,246,0.15)] text-[var(--gold-main)]"
              : "text-[var(--text-dim)] hover:text-[var(--text-muted)]",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
