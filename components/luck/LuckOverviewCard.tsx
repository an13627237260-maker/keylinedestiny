"use client";

import { useEffect, useMemo, useState } from "react";
import { animate, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { MysticCard } from "@/components/ui/mystic-card";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";
import {
  generateLuckOverview,
  type LuckCategory,
  type LuckPeriod,
} from "@/lib/fortune/luck";
import { LuckPeriodTabs } from "./LuckPeriodTabs";
import { LuckTimelineSelector } from "./LuckTimelineSelector";
import { LuckScoreBars } from "./LuckScoreBars";
import { LuckDetailSection } from "./LuckDetailSection";

export function LuckOverviewCard({
  baziResult,
  focusArea,
  targetDate = new Date(),
}: {
  baziResult: BaziAlgorithmResult;
  focusArea?: string;
  targetDate?: Date;
}) {
  const [period, setPeriod] = useState<LuckPeriod>("day");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<Exclude<LuckCategory, "overall">>("love");

  useEffect(() => {
    setOffset(0);
  }, [period]);

  const overview = useMemo(
    () =>
      generateLuckOverview({
        baziResult,
        targetDate,
        period,
        focusArea,
        timelineOffset: offset,
      }),
    [baziResult, targetDate, period, focusArea, offset],
  );

  const bestCategory = useMemo(() => {
    const sorted = [...overview.scores].sort((a, b) => b.score - a.score);
    return sorted[0]?.category as Exclude<LuckCategory, "overall">;
  }, [overview.scores]);

  useEffect(() => {
    setSelected(bestCategory);
  }, [bestCategory, period, offset]);

  const selectedScore =
    overview.scores.find((s) => s.category === selected) ?? overview.scores[0];

  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const controls = animate(0, overview.overallScore, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplayScore(Math.round(v)),
    });
    return () => controls.stop();
  }, [overview.overallScore]);

  const dateRangeLabel =
    overview.startDate === overview.endDate
      ? overview.startDate
      : `${overview.startDate} — ${overview.endDate}`;

  return (
    <MysticCard
      title="运势概览"
      description="基于本命与流日流月流年规则，用生活语言呈现趋势"
      icon={Sparkles}
      highlighted
    >
      <LuckPeriodTabs value={period} onChange={setPeriod} />

      <motion.div
        key={`${period}-${offset}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <LuckTimelineSelector
          period={period}
          offset={offset}
          onChange={setOffset}
          baseDate={targetDate}
          dateRangeLabel={dateRangeLabel}
        />

        <div className="mt-5 grid gap-6 sm:grid-cols-[minmax(0,140px)_1fr]">
          <div className="text-center sm:text-left">
            <p className="text-xs font-medium text-[var(--text-dim)]">综合分数</p>
            <div className="mt-1 flex items-baseline justify-center gap-1 sm:justify-start">
              <span className="font-display text-3xl font-bold text-[var(--gold-main)] sm:text-5xl">
                {displayScore}
              </span>
              <span className="text-sm text-[var(--text-dim)]">分</span>
            </div>
            <p className="mt-1 text-sm text-[var(--purple-light)]">{overview.overallLevel}</p>
            <p className="mt-2 text-[10px] text-[var(--text-dim)]">{overview.dateLabel}</p>
          </div>

          <LuckScoreBars
            scores={overview.scores}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        <LuckDetailSection score={selectedScore ?? null} />

        {(overview.highlights.length > 0 || overview.cautions.length > 0) && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {overview.highlights[0] && (
              <p className="rounded-lg bg-[rgba(139,92,246,0.06)] px-3 py-2 text-xs text-[var(--text-muted)]">
                <span className="text-[var(--gold-main)]">亮点 · </span>
                {overview.highlights[0]}
              </p>
            )}
            {overview.cautions[0] && (
              <p className="rounded-lg bg-[rgba(224,107,107,0.06)] px-3 py-2 text-xs text-[var(--text-muted)]">
                <span className="text-[var(--danger)]">留意 · </span>
                {overview.cautions[0]}
              </p>
            )}
          </div>
        )}
      </motion.div>
    </MysticCard>
  );
}
