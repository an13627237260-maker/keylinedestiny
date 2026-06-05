import { Shuffle } from "lucide-react";
import { MysticCard } from "@/components/ui/mystic-card";
import { PillBadge } from "@/components/ui/pill-badge";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";

export function RelationsCard({ algo }: { algo: BaziAlgorithmResult }) {
  const stemItems = [
    ...algo.stemRelations.combinations.map(
      (c) => `合 ${c.stems.join("")}→${c.result}`,
    ),
    ...algo.stemRelations.clashes.map((c) => `冲 ${c.stems.join("")}`),
  ];
  const branchItems = [
    ...algo.branchRelations.combinations.map((c) => c.description),
    ...algo.branchRelations.meetings.map((m) => m.description),
    ...algo.branchRelations.clashes.map((c) => `冲 ${c.branches.join("")}`),
    ...algo.branchRelations.harms.map((h) => `害 ${h.branches.join("")}`),
    ...algo.branchRelations.punishments.map((p) => p.description),
  ];

  const stable = stemItems.length === 0 && branchItems.length === 0;

  return (
    <MysticCard title="合冲刑害" description="天干地支互动关系 · 仅作倾向参考" icon={Shuffle}>
      {stable ? (
        <div className="rounded-xl border border-[var(--border-purple)] bg-[rgba(139,92,246,0.06)] px-4 py-6 text-center">
          <PillBadge variant="purple">结构平稳</PillBadge>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            命局地支结构相对平稳，未见显著合冲刑害。
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--gold-main)]">天干</p>
            <div className="flex flex-wrap gap-1.5">
              {stemItems.length ? (
                stemItems.map((item, i) => (
                  <PillBadge key={i} variant="muted">
                    {item}
                  </PillBadge>
                ))
              ) : (
                <span className="text-xs text-[var(--text-dim)]">无明显天干合冲</span>
              )}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--gold-main)]">地支</p>
            <div className="flex flex-wrap gap-1.5">
              {branchItems.map((item, i) => (
                <PillBadge key={i} variant="muted">
                  {item}
                </PillBadge>
              ))}
            </div>
          </div>
        </div>
      )}
    </MysticCard>
  );
}
