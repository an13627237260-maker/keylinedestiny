import { Compass } from "lucide-react";
import { MysticCard } from "@/components/ui/mystic-card";
import { PillBadge } from "@/components/ui/pill-badge";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";

export function PatternsCard({ algo }: { algo: BaziAlgorithmResult }) {
  if (!algo.patternTendencies?.length && !algo.usefulGods) return null;

  return (
    <MysticCard title="格局与喜用" description="倾向分析 · 非绝对定论" icon={Compass}>
      <div className="space-y-3">
        {algo.patternTendencies?.map((p) => (
          <div key={p.patternName} className="flex flex-wrap items-center gap-2">
            <PillBadge variant="gold">{p.patternName}</PillBadge>
            <span className="text-xs text-[var(--text-dim)]">信心 {p.confidence}%</span>
          </div>
        ))}
        {algo.usefulGods && (
          <>
            <p className="text-sm text-[var(--text-muted)]">
              喜用倾向：
              {algo.usefulGods.usefulElementTendency.map((el) => (
                <PillBadge key={el} element={el} className="ml-1">
                  {el}
                </PillBadge>
              ))}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              忌神倾向：
              {algo.usefulGods.avoidElementTendency.map((el) => (
                <PillBadge key={el} element={el} variant="muted" className="ml-1">
                  {el}
                </PillBadge>
              ))}
            </p>
            <p className="text-xs text-[var(--text-dim)]">{algo.usefulGods.caution}</p>
          </>
        )}
      </div>
    </MysticCard>
  );
}
