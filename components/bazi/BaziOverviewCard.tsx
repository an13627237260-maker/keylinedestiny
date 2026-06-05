import { LayoutGrid } from "lucide-react";
import { MysticCard } from "@/components/ui/mystic-card";
import { PillBadge } from "@/components/ui/pill-badge";
import { BRANCH_HIDDEN_STEMS } from "@/lib/fortune/bazi/hiddenStems";
import { labelPillar } from "@/lib/fortune/shared/labels";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";

const KEYS = ["year", "month", "day", "hour"] as const;

export function BaziOverviewCard({ algo }: { algo: BaziAlgorithmResult }) {
  return (
    <MysticCard
      title="四柱命盘"
      description="年、月、日、时四柱结构 · 日主为日柱天干"
      icon={LayoutGrid}
      highlighted
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KEYS.map((key) => {
          const pillar = algo.pillars[key];
          const isDay = key === "day";
          const hidden = BRANCH_HIDDEN_STEMS[pillar.branch] ?? [];
          const hiddenGods = hidden.map((stem) => {
            const entry = algo.tenGods.hiddenStemGods.find(
              (h) => h.branch === pillar.branch && h.stem === stem,
            );
            return entry ? `${stem}·${entry.god}` : stem;
          });

          return (
            <div
              key={key}
              className={`relative flex flex-col items-center rounded-xl border px-3 py-4 text-center ${
                isDay
                  ? "border-[var(--gold-main)]/40 bg-[rgba(214,181,109,0.06)] shadow-[0_0_20px_rgba(214,181,109,0.08)]"
                  : "border-[var(--border-purple)] bg-[rgba(8,6,17,0.5)]"
              }`}
            >
              <p className="text-[10px] tracking-widest text-[var(--text-dim)]">
                {labelPillar(key)}
              </p>
              <div className="my-2 flex flex-col items-center gap-0.5">
                <span className="font-display text-2xl font-bold text-[var(--gold-soft)]">
                  {pillar.stem}
                </span>
                <span className="h-px w-6 bg-[var(--border-soft)]" />
                <span className="font-display text-2xl font-bold text-[var(--purple-soft)]">
                  {pillar.branch}
                </span>
              </div>
              <PillBadge variant="purple" className="mb-2">
                {algo.tenGods.pillarStemGods[key]}
              </PillBadge>
              <div className="w-full space-y-1 text-left text-[10px] text-[var(--text-dim)]">
                <p>藏干 {hiddenGods.join(" ") || "—"}</p>
                <p>纳音 {algo.nayin?.[key]?.name ?? "—"}</p>
                <p>长生 {algo.twelveGrowthStages?.[key]?.stage ?? "—"}</p>
              </div>
              {isDay && (
                <span className="absolute -top-2 rounded-full border border-[var(--gold-main)]/50 bg-[var(--bg-card-solid)] px-2 py-0.5 text-[9px] text-[var(--gold-main)]">
                  日主
                </span>
              )}
            </div>
          );
        })}
      </div>
    </MysticCard>
  );
}
