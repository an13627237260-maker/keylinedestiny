import type { FortuneReport, ReportSection, RuleResult } from "../shared/reportTypes";
import { DISCLAIMER } from "../shared/constants";

export function joinParagraphs(parts: string[]): string {
  return parts.filter(Boolean).join("\n\n");
}

export function rulesToBullets(
  rules: RuleResult[],
  category?: string,
  limit = 6,
): string[] {
  const filtered = category
    ? rules.filter((r) => r.category === category)
    : rules;
  return filtered.slice(0, limit).map((r) => r.message);
}

export function buildReport(
  title: string,
  summary: string,
  sections: ReportSection[],
  advice: string[],
): FortuneReport {
  return {
    title,
    summary,
    sections,
    advice,
    disclaimer: DISCLAIMER,
  };
}

export function countChineseChars(text: string): number {
  return (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
}

export function reportTotalChars(report: FortuneReport): number {
  const all = [
    report.title,
    report.summary,
    ...report.sections.map((s) => s.title + s.content),
    ...report.advice,
    report.disclaimer,
  ].join("");
  return countChineseChars(all);
}
