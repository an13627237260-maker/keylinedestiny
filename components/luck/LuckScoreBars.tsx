"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LuckCategory, LuckScore } from "@/lib/fortune/luck";

export function LuckScoreBars({
  scores,
  selected,
  onSelect,
}: {
  scores: LuckScore[];
  selected: Exclude<LuckCategory, "overall">;
  onSelect: (cat: Exclude<LuckCategory, "overall">) => void;
}) {
  const subScores = scores.filter((s) => s.category !== "overall") as LuckScore[];

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none sm:justify-between sm:overflow-visible">
      {subScores.map((item, i) => {
        const active = item.category === selected;
        return (
          <button
            key={item.category}
            type="button"
            onClick={() => onSelect(item.category as Exclude<LuckCategory, "overall">)}
            className={cn(
              "flex min-w-[56px] shrink-0 flex-col items-center gap-1.5 rounded-xl px-2 py-2 transition-all sm:min-w-0 sm:flex-1",
              active && "bg-[rgba(139,92,246,0.08)] ring-1 ring-[rgba(214,181,109,0.25)]",
            )}
          >
            <div className="relative h-20 w-8 overflow-hidden rounded-full bg-[rgba(255,255,255,0.04)]">
              <motion.div
                className="absolute bottom-0 left-0 right-0 rounded-full"
                style={{
                  background: `linear-gradient(to top, ${item.color}cc, ${item.color}44)`,
                  boxShadow: active ? `0 0 12px ${item.color}55` : undefined,
                }}
                initial={{ height: 0 }}
                animate={{ height: `${item.score}%` }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <span
              className={cn(
                "font-display text-sm font-semibold",
                active ? "text-[var(--text-main)]" : "text-[var(--text-muted)]",
              )}
            >
              {item.score}
            </span>
            <span className="text-[10px] text-[var(--text-dim)]">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
