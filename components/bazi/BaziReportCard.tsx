"use client";

import { ScrollText } from "lucide-react";
import { MysticCard } from "@/components/ui/mystic-card";
import { ExpandableReportSection } from "@/components/ui/ExpandableReportSection";
import type { FortuneReport } from "@/lib/fortune/shared/reportTypes";

function sectionDefaultOpen(title: string, index: number): boolean {
  if (title.includes("概览") || title.includes("建议")) return true;
  return index === 0;
}

export function BaziReportCard({ report }: { report: FortuneReport }) {
  return (
    <MysticCard
      title="命理报告"
      description="传统规则引擎生成 · 本地算法"
      icon={ScrollText}
      highlighted
    >
      <div className="mb-4 rounded-xl border border-[var(--border-purple)] bg-[rgba(139,92,246,0.06)] px-4 py-3">
        <p className="text-sm leading-7 text-[var(--text-main)]">{report.summary}</p>
      </div>
      <div className="divide-y divide-[var(--border-soft)]">
        {report.sections.map((s, i) => (
          <ExpandableReportSection
            key={s.title}
            title={s.title}
            defaultOpen={sectionDefaultOpen(s.title, i)}
          >
            {s.content}
          </ExpandableReportSection>
        ))}
      </div>
      {report.advice.length > 0 && (
        <div className="mt-4 border-t border-[var(--border-soft)] pt-4">
          <ExpandableReportSection title="具体建议" defaultOpen>
            <ol className="space-y-3">
              {report.advice.map((a, i) => (
                <li
                  key={i}
                  className="flex gap-3 rounded-xl border border-[var(--border-soft)] bg-[rgba(8,6,17,0.4)] px-3 py-3 text-sm leading-7 text-[var(--text-muted)]"
                >
                  <span className="shrink-0 font-display text-[var(--gold-main)]">{i + 1}</span>
                  <span>{a}</span>
                </li>
              ))}
            </ol>
          </ExpandableReportSection>
        </div>
      )}
    </MysticCard>
  );
}
