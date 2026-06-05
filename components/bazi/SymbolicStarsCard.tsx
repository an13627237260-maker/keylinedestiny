import { Star } from "lucide-react";
import { MysticCard } from "@/components/ui/mystic-card";
import { PillBadge } from "@/components/ui/pill-badge";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";

export function SymbolicStarsCard({ algo }: { algo: BaziAlgorithmResult }) {
  const found = algo.symbolicStars.filter((s) => s.found);

  return (
    <MysticCard title="神煞辅助" description="辅助标签 · 不作绝对判断" icon={Star}>
      {found.length === 0 ? (
        <p className="text-sm text-[var(--text-dim)]">未见显著神煞命中，以四柱十神为主轴解读。</p>
      ) : (
        <div className="space-y-3">
          {found.map((s) => (
            <div
              key={s.name}
              className="rounded-xl border border-[var(--border-soft)] bg-[rgba(8,6,17,0.35)] p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <PillBadge variant="gold">{s.name}</PillBadge>
                <span className="text-xs text-[var(--text-dim)]">
                  {s.positions.join("、")}柱
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{s.meaning}</p>
              <p className="mt-1 text-[10px] text-[var(--text-dim)]">{s.caution}</p>
            </div>
          ))}
        </div>
      )}
    </MysticCard>
  );
}
