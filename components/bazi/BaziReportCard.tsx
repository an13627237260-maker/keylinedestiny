"use client";

import { ScrollText } from "lucide-react";
import { MysticCard } from "@/components/ui/mystic-card";
import type { FortuneReport } from "@/lib/fortune/shared/reportTypes";

export function BaziReportCard({ report }: { report: FortuneReport }) {
  return (
    <MysticCard
      title="命理报告"
      description="传统规则引擎生成 · 本地算法"
      icon={ScrollText}
      highlighted
    >
      <div className="mb-4 rounded-xl border border-[var(--border-purple)] bg-[rgba(139,92,246,0.06)] px-4 py-3">
        <p className="text-sm leading-relaxed text-[var(--text-main)]">{report.summary}</p>
      </div>
      <div className="space-y-8">
        {report.sections.map((s) => (
          <article key={s.title}>
            <h4 className="font-display text-base font-semibold text-[var(--gold-soft)]">
              {s.title}
            </h4>
            <div className="mt-2 whitespace-pre-wrap text-sm leading-[1.85] text-[var(--text-muted)]">
              {s.content}
            </div>
          </article>
        ))}
      </div>
      {report.advice.length > 0 && (
        <div className="mt-8 border-t border-[var(--border-soft)] pt-6">
          <h4 className="font-display text-sm font-semibold text-[var(--gold-main)]">具体建议</h4>
          <ol className="mt-3 space-y-2">
            {report.advice.map((a, i) => (
              <li key={i} className="flex gap-3 text-sm text-[var(--text-muted)]">
                <span className="font-display text-[var(--gold-main)]">{i + 1}.</span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </MysticCard>
  );
}
