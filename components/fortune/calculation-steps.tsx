"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalculationStep } from "@/lib/fortune/shared/types";

export function CalculationStepsPanel({
  steps,
}: {
  steps: CalculationStep[];
}) {
  return (
    <Accordion.Root type="multiple" className="space-y-2">
      {steps.map((step, i) => (
        <Accordion.Item
          key={`${step.step}-${i}`}
          value={`${step.step}-${i}`}
          className="rounded-lg border border-violet-500/20 bg-zinc-950/50"
        >
          <Accordion.Header>
            <Accordion.Trigger className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-violet-200 hover:bg-violet-500/5 [&[data-state=open]>svg]:rotate-180">
              {step.title}
              <ChevronDown className="h-4 w-4 transition-transform" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="px-4 pb-4 text-sm text-zinc-400 data-[state=open]:animate-in">
            <p className="mb-2 text-zinc-500">方法：{step.method}</p>
            <pre className="mb-2 overflow-x-auto rounded bg-black/40 p-2 text-xs">
              {JSON.stringify(step.result, null, 2)}
            </pre>
            {step.notes.length > 0 && (
              <ul className="list-disc pl-4 text-xs text-amber-400/80">
                {step.notes.map((n, j) => (
                  <li key={j}>{n}</li>
                ))}
              </ul>
            )}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

export function DisclaimerBanner({ text }: { text: string }) {
  return (
    <div className={cn("rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90")}>
      {text}
    </div>
  );
}
