import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { computeBazi } from "@/lib/fortune/bazi";
import { generateLuckOverview } from "@/lib/fortune/luck";

const INPUT = {
  gender: "male" as const,
  birthDate: "1990-05-15",
  birthTime: "10:30",
  timezone: "Asia/Shanghai",
  useTrueSolarTime: false,
  focusArea: "overall" as const,
};

function scoreKey(overview: ReturnType<typeof generateLuckOverview>): string {
  return overview.scores.map((score) => `${score.category}:${score.score}`).join("|");
}

describe("period variation", () => {
  const bazi = computeBazi(INPUT).algorithm_result;
  const anchor = new Date("2026-06-05");

  it("今天和明天结果不同，且同一日期重复计算一致", () => {
    const today = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "day" });
    const tomorrow = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "day", timelineOffset: 1 });
    const again = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "day" });
    expect(scoreKey(today)).not.toBe(scoreKey(tomorrow));
    expect(today).toEqual(again);
  });

  it("本周和下周结果不同", () => {
    const current = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "week" });
    const next = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "week", timelineOffset: 1 });
    expect(scoreKey(current)).not.toBe(scoreKey(next));
    expect(current.startDate).not.toBe(next.startDate);
  });

  it("本月和下月结果不同", () => {
    const current = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "month" });
    const next = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "month", timelineOffset: 1 });
    expect(scoreKey(current)).not.toBe(scoreKey(next));
    expect(current.transitSummary.monthPillar).not.toBe(next.transitSummary.monthPillar);
  });

  it("今年和明年结果不同", () => {
    const current = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "year" });
    const next = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "year", timelineOffset: 1 });
    expect(scoreKey(current)).not.toBe(scoreKey(next));
    expect(current.transitSummary.yearPillar).not.toBe(next.transitSummary.yearPillar);
  });

  it("周月年计算依据分别使用 7 天流日、节气流月、流年大运与 12 个月趋势", () => {
    const week = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "week" });
    const month = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "month" });
    const year = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "year" });

    expect(week.calculationBasis.some((basis) => basis.includes("聚合本周 7 天流日"))).toBe(true);
    expect(month.calculationBasis.some((basis) => basis.includes("节气流月"))).toBe(true);
    expect(year.calculationBasis.some((basis) => basis.includes("流年为主导"))).toBe(true);
    expect(year.calculationBasis.some((basis) => basis.includes("当前大运"))).toBe(true);
    expect(year.calculationBasis.some((basis) => basis.includes("12个月节气流月趋势"))).toBe(true);
  });

  it("不使用 Math.random", () => {
    const files = [
      "lib/fortune/luck/luckScoring.ts",
      "lib/fortune/luck/transitCalculator.ts",
      "lib/fortune/luck/luckText.ts",
      "lib/fortune/rules/ruleEngine.ts",
    ];
    for (const file of files) {
      expect(readFileSync(file, "utf8")).not.toContain("Math.random");
    }
  });
});
