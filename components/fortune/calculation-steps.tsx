"use client";

import type { ReactNode } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalculationStep } from "@/lib/fortune/shared/types";

function formatResult(result: Record<string, unknown>): ReactNode {
  const entries = Object.entries(result);
  if (entries.length === 0) return <span className="text-[var(--text-dim)]">—</span>;

  return (
    <dl className="space-y-1.5">
      {entries.map(([key, value]) => (
        <div key={key} className="grid grid-cols-[minmax(6rem,30%)_1fr] gap-2 text-xs">
          <dt className="text-[var(--text-dim)]">{key}</dt>
          <dd className="break-words text-[var(--text-muted)]">
            {typeof value === "object" && value !== null
              ? JSON.stringify(value, null, 0).slice(0, 200)
              : String(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function CalculationStepsPanel({
  steps,
}: {
  steps: CalculationStep[];
}) {
  return (
    <Accordion.Root type="multiple" className="space-y-2" defaultValue={[]}>
      {steps.map((step, i) => (
        <Accordion.Item
          key={`${step.step}-${i}`}
          value={`${step.step}-${i}`}
          className="rounded-xl border border-[var(--border-soft)] bg-[rgba(8,6,17,0.4)]"
        >
          <Accordion.Header>
            <Accordion.Trigger className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[var(--purple-soft)] hover:bg-[rgba(139,92,246,0.04)] [&[data-state=open]>svg]:rotate-180">
              {step.title}
              <ChevronDown className="h-4 w-4 text-[var(--gold-main)] transition-transform" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="border-t border-[var(--border-soft)] px-4 pb-4 pt-3 text-sm">
            <p className="mb-3 text-xs text-[var(--text-dim)]">
              方法：{step.method}
            </p>
            {formatResult(step.result)}
            {step.notes.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-[var(--border-soft)] pt-3 text-xs text-[var(--warning)]/90">
                {step.notes.map((n, j) => (
                  <li key={j}>· {n}</li>
                ))}
              </ul>
            )}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

export function DisclaimerBanner({ text, subtle }: { text: string; subtle?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-xs leading-relaxed",
        subtle
          ? "border-[var(--border-soft)] bg-[rgba(8,6,17,0.4)] text-[var(--text-dim)]"
          : "border-[rgba(214,181,109,0.25)] bg-[rgba(214,181,109,0.06)] text-[var(--text-muted)]",
      )}
    >
      {text}
    </div>
  );
}
