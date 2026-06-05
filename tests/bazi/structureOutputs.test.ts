import { describe, expect, it } from "vitest";
import { computeBazi } from "@/lib/fortune/bazi";

const INPUT = {
  gender: "female" as const,
  birthDate: "1988-08-08",
  birthTime: "08:00",
  timezone: "Asia/Shanghai",
  useTrueSolarTime: false,
  focusArea: "overall" as const,
  targetYear: 2026,
};

describe("bazi structure outputs", () => {
  const { algorithm_result, calculation_steps } = computeBazi(INPUT);

  it("五行输出包含 raw/weighted/percent/ranking/explanation", () => {
    const five = algorithm_result.fiveElements;
    expect(five.rawScores).toBeDefined();
    expect(five.weightedScores).toBeDefined();
    expect(five.percentages).toBeDefined();
    expect(five.elementRanking).toHaveLength(5);
    expect(five.explanation.join("")).toContain("天干");
    expect(five.explanation.join("")).toContain("藏干");
    expect(five.explanation.join("")).toContain("月令");
    expect(five.strongestElement).toBeTruthy();
    expect(five.weakestElement).toBeTruthy();
    expect(five.balanceScore).toBeGreaterThanOrEqual(0);
  });

  it("十神输出包含 evidence", () => {
    const ten = algorithm_result.tenGods;
    expect(ten.pillarStemGods.year).toBeTruthy();
    expect(ten.hiddenStemGods.length).toBeGreaterThan(0);
    expect(Object.values(ten.counts).some((value) => value > 0)).toBe(true);
    expect(ten.dominantTendency.length).toBeGreaterThan(0);
    expect(ten.evidence.length).toBeGreaterThan(0);
  });

  it("日主强弱包含得令得地得助和 confidence", () => {
    const dm = algorithm_result.dayMasterStrength;
    expect(dm.dayMaster).toBeTruthy();
    expect(dm.dayMasterElement).toBeTruthy();
    expect(["strong", "balanced", "weak"]).toContain(dm.strengthLevel);
    expect(dm.reasoning.join("")).toContain("月令");
    expect(dm.confidence).toBeGreaterThanOrEqual(55);
    expect(dm.confidence).toBeLessThanOrEqual(90);
  });

  it("喜用输出包含调候通关倾向字段", () => {
    const useful = algorithm_result.usefulGods;
    expect(Array.isArray(useful.usefulElementTendency)).toBe(true);
    expect(Array.isArray(useful.avoidElementTendency)).toBe(true);
    expect(Array.isArray(useful.regulatingElementTendency)).toBe(true);
    expect(useful.reasoning.length).toBeGreaterThan(0);
    expect(useful.caution).toContain("倾向");
  });

  it("大运输出 currentCycle 并写入 calculation_steps", () => {
    expect(algorithm_result.luckCycle.currentCycle).toBeDefined();
    const step = calculation_steps.find((item) => item.step === "luck_cycle");
    expect(step?.result.currentCycle).toBeDefined();
  });

  it("神煞输出完整字段且至少 19 项", () => {
    expect(algorithm_result.symbolicStars.length).toBeGreaterThanOrEqual(19);
    for (const star of algorithm_result.symbolicStars) {
      expect(star.name).toBeTruthy();
      expect(typeof star.found).toBe("boolean");
      expect(Array.isArray(star.positions)).toBe(true);
      expect(star.basedOn).toBeTruthy();
      expect(star.meaning).toBeTruthy();
      expect(star.strength).toBeTruthy();
      expect(star.caution).toBeTruthy();
    }
  });
});
