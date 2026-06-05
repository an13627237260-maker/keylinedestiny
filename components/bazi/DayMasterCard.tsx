import { User } from "lucide-react";
import { MysticCard } from "@/components/ui/mystic-card";
import { labelStrength } from "@/lib/fortune/shared/labels";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";

export function DayMasterCard({ algo }: { algo: BaziAlgorithmResult }) {
  const dm = algo.dayMasterStrength;
  return (
    <MysticCard title="日主强弱" description="得令、得地、得助与受克综合判断" icon={User}>
      <p className="text-sm text-[var(--text-muted)]">
        日主 <span className="text-[var(--gold-main)]">{dm.dayMaster}</span>（{dm.dayMasterElement}）
        ，等级 <span className="text-[var(--purple-soft)]">{labelStrength(dm.strengthLevel)}</span>
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs text-[var(--text-dim)]">支持因素</p>
          <ul className="space-y-1 text-sm text-[var(--text-muted)]">
            {dm.supportFactors.map((f, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--success)]">+</span> {f}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs text-[var(--text-dim)]">消耗因素</p>
          <ul className="space-y-1 text-sm text-[var(--text-muted)]">
            {dm.weakeningFactors.map((f, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--warning)]">−</span> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MysticCard>
  );
}
