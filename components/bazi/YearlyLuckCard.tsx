import { Calendar } from "lucide-react";
import { MysticCard } from "@/components/ui/mystic-card";
import { PillBadge } from "@/components/ui/pill-badge";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";

export function YearlyLuckCard({ algo }: { algo: BaziAlgorithmResult }) {
  const y = algo.yearlyLuck;

  return (
    <MysticCard title="流年趋势" description="目标年份干支与原局互动" icon={Calendar}>
      {!y ? (
        <p className="text-sm text-[var(--text-muted)]">
          填写「目标年份」后可查看该年流年干支与趋势标签。
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display text-3xl font-bold text-[var(--gold-main)]">
              {y.targetYear}
            </span>
            <PillBadge variant="gold">{y.yearPillar}</PillBadge>
            <PillBadge variant="purple">十神 {y.yearStemTenGod}</PillBadge>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            {Object.values(y.focusAreaHints)[0]}
          </p>
          {y.relationWithLuckCycle.map((r, i) => (
            <p key={i} className="text-xs text-[var(--text-dim)]">
              {r}
            </p>
          ))}
        </div>
      )}
    </MysticCard>
  );
}
