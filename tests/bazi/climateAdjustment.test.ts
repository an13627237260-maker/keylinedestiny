import { describe, expect, it } from "vitest";
import { computeBazi } from "@/lib/fortune/bazi";
import { evaluateClimateAdjustment } from "@/lib/fortune/bazi/climateAdjustment";
import type { FiveElementsAnalysis } from "@/lib/fortune/bazi/fiveElements";
import type { DayMasterStrengthAnalysis } from "@/lib/fortune/bazi/dayMasterStrength";
import type { FourPillars } from "@/lib/fortune/bazi/pillars";
import type { EarthlyBranch, FiveElement, HeavenlyStem } from "@/lib/fortune/bazi/constants";

function pillar(stem: HeavenlyStem, branch: EarthlyBranch, index = 0) {
  return { stem, branch, index };
}

function distribution(overrides: Partial<Record<FiveElement, number>> = {}): FiveElementsAnalysis {
  const percentages: Record<FiveElement, number> = {
    木: overrides.木 ?? 15,
    火: overrides.火 ?? 15,
    土: overrides.土 ?? 20,
    金: overrides.金 ?? 25,
    水: overrides.水 ?? 25,
  };
  const weightedScores: Record<FiveElement, number> = { ...percentages };
  const ranking = (Object.entries(percentages) as [FiveElement, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([element, percentage]) => ({ element, percentage, score: weightedScores[element] }));
  return {
    rawScores: weightedScores,
    weightedScores,
    percentages,
    strongestElement: ranking[0].element,
    weakestElement: ranking[ranking.length - 1].element,
    balanceScore: 70,
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

describe("climateAdjustment", () => {
  it("庚金子月识别寒湿和火调候", () => {
    const result = computeBazi({
      gender: "female",
      birthDate: "1979-12-31",
      birthTime: "06:00",
      province: "湖北省",
      city: "天门市",
      longitude: 113.1661,
      latitude: 30.6634,
      timezone: "Asia/Shanghai",
      useTrueSolarTime: true,
      focusArea: "overall",
      targetYear: 2026,
    });
    const climate = result.algorithm_result.climate;
    expect(["寒湿", "寒"]).toContain(climate.climateType);
    expect(climate.reasoning.join("")).toContain("庚金生于子月");
    expect(climate.usefulClimateHints.join("")).toContain("火为重要调候倾向");
  });

  it("火旺夏月识别燥热", () => {
    const pillars: FourPillars = {
      year: pillar("戊", "辰"),
      month: pillar("戊", "午"),
      day: pillar("丁", "巳"),
      hour: pillar("丙", "午"),
    };
    const climate = evaluateClimateAdjustment({
      pillars,
      elementDistribution: distribution({ 火: 42, 土: 30, 水: 8, 金: 8, 木: 12 }),
      dayMasterStrength: strength("丁"),
    });
    expect(climate.climateType).toBe("燥热");
    expect(climate.regulatingElements).toEqual(expect.arrayContaining(["水", "金"]));
  });

  it("未戌月识别燥土并提示水木", () => {
    const pillars: FourPillars = {
      year: pillar("戊", "戌"),
      month: pillar("己", "戌"),
      day: pillar("庚", "辰"),
      hour: pillar("戊", "戌"),
    };
    const climate = evaluateClimateAdjustment({
      pillars,
      elementDistribution: distribution({ 土: 50, 火: 15, 金: 15, 水: 10, 木: 10 }),
      dayMasterStrength: strength("庚"),
    });
    expect(climate.climateType).toBe("燥");
    expect(climate.regulatingElements).toEqual(expect.arrayContaining(["水", "木"]));
  });
});
