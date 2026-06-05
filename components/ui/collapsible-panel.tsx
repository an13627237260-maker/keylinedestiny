"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function CollapsiblePanel({
  title,
  description,
  children,
  defaultOpen = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[rgba(139,92,246,0.04)]"
        aria-expanded={open}
      >
        <div>
          <p className="font-display text-sm font-semibold text-[var(--text-main)]">{title}</p>
          {description && (
            <p className="mt-0.5 text-xs text-[var(--text-dim)]">{description}</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--gold-main)] transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {open && <div className="border-t border-[var(--border-soft)] px-5 py-4">{children}</div>}
    </div>
  );
}
