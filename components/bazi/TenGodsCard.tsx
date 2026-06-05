import { GitBranch } from "lucide-react";
import { MysticCard } from "@/components/ui/mystic-card";
import { PillBadge } from "@/components/ui/pill-badge";
import { labelFocusArea } from "@/lib/fortune/shared/labels";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";

export function TenGodsCard({
  algo,
  focusArea,
}: {
  algo: BaziAlgorithmResult;
  focusArea?: string;
}) {
  const counts = Object.entries(algo.tenGods.counts)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <MysticCard title="十神结构" description="天干与藏干十神加权统计" icon={GitBranch}>
      <div className="flex flex-wrap gap-2">
        {counts.map(([god, count]) => (
          <PillBadge
            key={god}
            variant={algo.tenGods.dominantTendency.includes(god as (typeof algo.tenGods.dominantTendency)[number]) ? "gold" : "default"}
          >
            {god} {count.toFixed(1)}
          </PillBadge>
        ))}
      </div>
      <p className="mt-4 text-sm text-[var(--text-muted)]">
        主要倾向：
        <span className="text-[var(--gold-soft)]">
          {algo.tenGods.dominantTendency.join("、") || "分布较平均"}
        </span>
      </p>
      <p className="mt-2 text-xs leading-relaxed text-[var(--text-dim)]">
        十神反映性格与{labelFocusArea(focusArea)}主题的结构性倾向，越突出者越容易在行为模式中显现。
      </p>
    </MysticCard>
  );
}
