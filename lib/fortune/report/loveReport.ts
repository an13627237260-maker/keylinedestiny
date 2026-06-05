import type { LoveCompatibilityResult } from "../bazi/compatibility";
import type { FortuneReport } from "../shared/reportTypes";
import { buildReport, joinParagraphs } from "./templateEngine";

export function generateLoveReport(result: LoveCompatibilityResult): FortuneReport {
  const summary = `合盘匹配度约 ${result.matchScore} 分。${result.longTermPotential}`;
  return buildReport(
    "情感合盘报告",
    summary,
    [
      {
        title: "吸引力与默契",
        content: joinParagraphs(result.attractionPoints),
      },
      {
        title: "摩擦与差异",
        content: joinParagraphs(result.conflictPoints),
      },
      {
        title: "五行互补",
        content: `互补元素：${result.complementaryElements.join("、") || "各有特色"}`,
      },
      {
        title: "相处建议",
        content: joinParagraphs(result.communicationAdvice),
      },
    ],
    result.communicationAdvice.slice(0, 8),
  );
}
