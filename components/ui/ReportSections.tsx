"use client";

import { ExpandableReportSection } from "./ExpandableReportSection";
import type { FortuneReport } from "@/lib/fortune/shared/reportTypes";

function sectionDefaultOpen(title: string, index: number): boolean {
  if (title.includes("概览") || title.includes("建议")) return true;
  return index === 0;
}

export function ReportSections({ report }: { report: FortuneReport }) {
  return (
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
      {report.advice.length > 0 && (
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
      )}
    </div>
  );
}
