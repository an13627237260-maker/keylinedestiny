import type { LoveCompatibilityResult } from "../bazi/compatibility";
import type { FortuneReport } from "../shared/reportTypes";
import { buildReport, joinParagraphs } from "./templateEngine";

export function generateLoveReport(result: LoveCompatibilityResult): FortuneReport {
  const summary = `合盘匹配度约 ${result.matchScore} 分。${result.longTermPotential} 本报告只解释双方 algorithm_result 与 evidence。`;
  const dayMasterEvidence = result.evidence.attractionPoints.filter((item) =>
    item.title.includes("日主"),
  );
  const partnerEvidence = result.evidence.attractionPoints.filter((item) =>
    item.title.includes("伴侣星"),
  );
  return buildReport(
    "情感合盘报告",
    summary,
    [
      {
        title: "吸引力与默契",
        content: joinParagraphs(result.attractionPoints),
        evidence: result.evidence.attractionPoints,
      },
      {
        title: "摩擦与差异",
        content: joinParagraphs(result.conflictPoints),
        evidence: result.evidence.conflictPoints,
      },
      {
        title: "五行互补",
        content: `互补元素：${result.complementaryElements.join("、") || "各有特色"}`,
        evidence: dayMasterEvidence.length
          ? dayMasterEvidence
          : result.evidence.attractionPoints.slice(0, 1),
      },
      {
        title: "伴侣星辅助",
        content: joinParagraphs(
          result.partnerStarStatus.map(
            (status) =>
              `${status.person}方伴侣星：${status.stars.join("、") || "未按性别展开"}，计数 ${status.count.toFixed(1)}。${status.note}`,
          ),
        ),
        evidence: partnerEvidence.length ? partnerEvidence : result.evidence.advice.slice(0, 1),
      },
      {
        title: "相处建议",
        content: joinParagraphs(result.communicationAdvice),
        evidence: result.evidence.advice,
      },
    ],
    result.communicationAdvice.slice(0, 8),
  );
}
