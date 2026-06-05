import { TrendingUp } from "lucide-react";
import { MysticCard } from "@/components/ui/mystic-card";
import { labelLuckDirection } from "@/lib/fortune/shared/labels";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";

export function LuckCycleCard({ algo }: { algo: BaziAlgorithmResult }) {
  const lc = algo.luckCycle;
  const targetYear = algo.yearlyLuck?.targetYear;
  const currentIdx = lc.cycles.findIndex(
    (c) => targetYear && c.startYear <= targetYear && c.endYear >= targetYear,
  );

  return (
    <MysticCard title="大运时间轴" description="十年一步 · 顺逆由性别与年干阴阳决定" icon={TrendingUp}>
      {lc.cycles.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">
          未计算大运（请填写性别）。{lc.warnings.join(" ")}
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-[var(--text-muted)]">
            {labelLuckDirection(lc.direction)} · 起运约{" "}
            <span className="text-[var(--gold-main)]">{lc.startAge}</span> 岁
          </p>
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border-soft)] text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
                  <th className="py-2 pr-3">步</th>
                  <th className="py-2 pr-3">大运</th>
                  <th className="py-2 pr-3">十神</th>
                  <th className="py-2 pr-3">年龄</th>
                  <th className="py-2">年份</th>
                </tr>
              </thead>
              <tbody>
                {lc.cycles.map((c, i) => (
                  <tr
                    key={c.index}
                    className={`border-b border-[rgba(255,255,255,0.04)] ${
                      i === currentIdx
                        ? "bg-[rgba(214,181,109,0.08)]"
                        : ""
                    }`}
                  >
                    <td className="py-2.5 pr-3 text-[var(--text-dim)]">{c.index}</td>
                    <td className="py-2.5 pr-3 font-display font-semibold text-[var(--gold-soft)]">
                      {c.pillar.stem}
                      {c.pillar.branch}
                    </td>
                    <td className="py-2.5 pr-3 text-[var(--text-muted)]">{c.stemTenGod}</td>
                    <td className="py-2.5 pr-3 text-[var(--text-muted)]">
                      {c.startAge}-{c.endAge}
                    </td>
                    <td className="py-2.5 text-[var(--text-dim)]">
                      {c.startYear}-{c.endYear}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </MysticCard>
  );
}
