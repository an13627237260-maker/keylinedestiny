"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExpandableReportSection({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className={cn("border-b border-[var(--border-soft)] last:border-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-h-[44px] items-center justify-between gap-3 py-3 text-left"
      >
        <h4 className="font-display text-sm font-semibold text-[var(--gold-soft)] md:text-base">
          {title}
        </h4>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--text-dim)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="pb-4 text-sm leading-7 text-[var(--text-muted)] whitespace-pre-wrap">
          {children}
        </div>
      )}
    </article>
  );
}
