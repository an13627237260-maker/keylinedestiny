import { describe, expect, it } from "vitest";
import { analyzeBranchRelations } from "@/lib/fortune/bazi/branchRelations";
import { evaluateClimateAdjustment } from "@/lib/fortune/bazi/climateAdjustment";
import { analyzeHealthTendency } from "@/lib/fortune/bazi/healthTendency";
import type { FiveElementsAnalysis } from "@/lib/fortune/bazi/fiveElements";
import type { DayMasterStrengthAnalysis } from "@/lib/fortune/bazi/dayMasterStrength";
import type { EarthlyBranch, FiveElement, HeavenlyStem } from "@/lib/fortune/bazi/constants";
import type { FourPillars } from "@/lib/fortune/bazi/pillars";

function pillar(stem: HeavenlyStem, branch: EarthlyBranch, index = 0) {
  return { stem, branch, index };
}

function distribution(percentages: Record<FiveElement, number>): FiveElementsAnalysis {
  const ranking = (Object.entries(percentages) as [FiveElement, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([element, percentage]) => ({ element, percentage, score: percentage }));
  return {
    rawScores: percentages,
    weightedScores: percentages,
    percentages,
    strongestElement: ranking[0].element,
    weakestElement: ranking[ranking.length - 1].element,
    balanceScore: 60,
    elementRanking: ranking,
    explanation: [],
    usefulElementTendency: [],
    notes: [],
  };
}

function strength(dayMaster: HeavenlyStem): DayMasterStrengthAnalysis {
  return {
    dayMaster,
    dayMasterElement: dayMaster === "庚" ? "金" : "火",
    strengthScore: 50,
    strengthLevel: "balanced",
    supportFactors: [],
    weakeningFactors: [],
    reasoning: [],
    confidence: 70,
  };
}

describe("healthTendency", () => {
  it("火旺输出健康象意和免责声明", () => {
    const pillars: FourPillars = {
      year: pillar("丙", "午"),
      month: pillar("丁", "午"),
      day: pillar("丁", "巳"),
      hour: pillar("丙", "午"),
    };
    const elements = distribution({ 木: 10, 火: 55, 土: 15, 金: 10, 水: 10 });
    const climate = evaluateClimateAdjustment({
      pillars,
      elementDistribution: elements,
      dayMasterStrength: strength("丁"),
    });
    const health = analyzeHealthTendency({
      pillars,
      elementDistribution: elements,
      climate,
      branchRelations: analyzeBranchRelations(pillars).analysis,
    });
    expect(health.tendencies.some((t) => t.element === "火" && t.reason.includes("睡眠"))).toBe(true);
    expect(health.disclaimer).toContain("不构成医学诊断");
  });

  it("水寒输出寒湿象意和免责声明", () => {
    const pillars: FourPillars = {
      year: pillar("己", "未"),
      month: pillar("丙", "子"),
      day: pillar("庚", "午"),
      hour: pillar("己", "卯"),
    };
    const elements = distribution({ 木: 10, 火: 15, 土: 20, 金: 20, 水: 35 });
    const climate = evaluateClimateAdjustment({
      pillars,
      elementDistribution: elements,
      dayMasterStrength: strength("庚"),
    });
    const health = analyzeHealthTendency({
      pillars,
      elementDistribution: elements,
      climate,
      branchRelations: analyzeBranchRelations(pillars).analysis,
    });
    expect(health.tendencies.some((t) => t.element === "水" && t.reason.includes("寒湿"))).toBe(true);
    expect(health.disclaimer).toContain("专业医生");
  });
});
