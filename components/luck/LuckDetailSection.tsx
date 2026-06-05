"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { LuckScore } from "@/lib/fortune/luck";
import { PillBadge } from "@/components/ui/pill-badge";

export function LuckDetailSection({ score }: { score: LuckScore | null }) {
  if (!score) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={score.category}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25 }}
        className="mt-5 rounded-xl border border-[var(--border-soft)] bg-[rgba(8,6,17,0.4)] p-4"
      >
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: score.color, boxShadow: `0 0 8px ${score.color}88` }}
          />
          <h4 className="font-display text-sm font-semibold text-[var(--text-main)]">
            {score.label}
          </h4>
          <span className="font-display text-lg text-[var(--gold-main)]">{score.score}</span>
          <PillBadge variant="muted">{score.level}</PillBadge>
          <ChevronRight className="ml-auto h-4 w-4 text-[var(--text-dim)]" />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{score.summary}</p>
        <p className="mt-2 text-xs leading-relaxed text-[var(--text-dim)]">{score.detail}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {score.keywords.map((kw) => (
            <PillBadge key={kw} variant="purple">
              {kw}
            </PillBadge>
          ))}
        </div>

        <ul className="mt-4 space-y-1.5">
          {score.advice.map((a) => (
            <li key={a} className="flex gap-2 text-xs text-[var(--text-dim)]">
              <span className="text-[var(--gold-main)]">·</span>
              {a}
            </li>
          ))}
        </ul>

        {score.evidence.length > 0 && (
          <div className="mt-4 border-t border-[var(--border-soft)] pt-3">
            <p className="text-xs font-medium text-[var(--purple-soft)]">依据</p>
            <ul className="mt-2 space-y-1.5">
              {score.evidence.slice(0, 5).map((item) => (
                <li key={item.id} className="text-xs leading-relaxed text-[var(--text-dim)]">
                  <span className="text-[var(--gold-main)]">{item.title} · </span>
                  {item.detail}
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
