import { describe, expect, it } from "vitest";
import { computeBazi } from "@/lib/fortune/bazi";
import { generateLuckOverview, type LuckPeriod } from "@/lib/fortune/luck";

const INPUT = {
  gender: "male" as const,
  birthDate: "1990-05-15",
  birthTime: "10:30",
  timezone: "Asia/Shanghai",
  useTrueSolarTime: false,
  focusArea: "overall" as const,
};

const PERIODS: LuckPeriod[] = ["day", "week", "month", "year"];

describe("luck score breakdown", () => {
  const bazi = computeBazi(INPUT).algorithm_result;
  const date = new Date("2026-06-05");

  it("scoreBreakdown.final 等于 score", () => {
    for (const period of PERIODS) {
      const overview = generateLuckOverview({ baziResult: bazi, targetDate: date, period });
      for (const score of overview.scores) {
        expect(score.scoreBreakdown.base).toBe(70);
        expect(score.scoreBreakdown.final).toBe(score.score);
        expect(score.score).toBeGreaterThanOrEqual(42);
        expect(score.score).toBeLessThanOrEqual(96);
      }
    }
  });

  it("evidence 不为空且为结构化证据", () => {
    const overview = generateLuckOverview({ baziResult: bazi, targetDate: date, period: "day" });
    for (const score of overview.scores) {
      expect(score.evidence.length).toBeGreaterThan(0);
      expect(score.evidence[0].id).toBeTruthy();
      expect(score.evidence[0].detail).toBeTruthy();
      expect(score.detail).toContain("分数拆解");
    }
  });

  it("日周月年文案包含对应流期信息", () => {
    const day = generateLuckOverview({ baziResult: bazi, targetDate: date, period: "day" });
    const week = generateLuckOverview({ baziResult: bazi, targetDate: date, period: "week" });
    const month = generateLuckOverview({ baziResult: bazi, targetDate: date, period: "month" });
    const year = generateLuckOverview({ baziResult: bazi, targetDate: date, period: "year" });

    expect(day.scores.map((s) => s.summary).join("")).toContain(`流日${day.transitSummary.dayPillar}`);
    expect(week.scores.map((s) => s.summary).join("")).toContain(week.startDate);
    expect(month.scores.map((s) => s.summary).join("")).toContain(`流月${month.transitSummary.monthPillar}`);
    expect(year.scores.map((s) => s.summary).join("")).toContain(`流年${year.transitSummary.yearPillar}`);
  });
});
