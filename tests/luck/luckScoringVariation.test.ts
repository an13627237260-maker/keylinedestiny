import { describe, it, expect } from "vitest";
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

const CATEGORIES = ["love", "wealth", "career", "study", "social"] as const;

function getBazi() {
  return computeBazi(INPUT).algorithm_result;
}

function scoresMap(overview: ReturnType<typeof generateLuckOverview>) {
  return Object.fromEntries(
    overview.scores.map((s) => [s.category, s.score]),
  ) as Record<string, number>;
}

describe("luckScoring variation", () => {
  const bazi = getBazi();
  const anchor = new Date("2026-06-05");

  it("不同日期日运不同", () => {
    const d1 = generateLuckOverview({
      baziResult: bazi,
      targetDate: new Date("2026-01-01"),
      period: "day",
    });
    const d2 = generateLuckOverview({
      baziResult: bazi,
      targetDate: new Date("2026-08-20"),
      period: "day",
    });
    expect(d1.overallScore).not.toBe(d2.overallScore);
  });

  it("本周与下周不同", () => {
    const w0 = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "week", timelineOffset: 0 });
    const w1 = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "week", timelineOffset: 1 });
    const same = CATEGORIES.every(
      (c) => scoresMap(w0)[c] === scoresMap(w1)[c],
    );
    expect(same).toBe(false);
  });

  it("本月与下月不同", () => {
    const m0 = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "month", timelineOffset: 0 });
    const m1 = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "month", timelineOffset: 1 });
    const same = CATEGORIES.every(
      (c) => scoresMap(m0)[c] === scoresMap(m1)[c],
    );
    expect(same).toBe(false);
  });

  it("今年与去年不同", () => {
    const y0 = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "year", timelineOffset: 0 });
    const y1 = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "year", timelineOffset: -1 });
    const same = CATEGORIES.every(
      (c) => scoresMap(y0)[c] === scoresMap(y1)[c],
    );
    expect(same).toBe(false);
  });

  it("day/week/month/year 综合分不应完全相同", () => {
    const day = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "day" });
    const week = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "week" });
    const month = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "month" });
    const year = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "year" });
    const scores = [day.overallScore, week.overallScore, month.overallScore, year.overallScore];
    const unique = new Set(scores);
    expect(unique.size).toBeGreaterThan(1);
  });

  it("同一输入重复计算完全一致", () => {
    const a = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "week", timelineOffset: 1 });
    const b = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "week", timelineOffset: 1 });
    expect(a).toEqual(b);
  });

  it("calculationBasis 与 debugHash 存在", () => {
    const o = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "month" });
    expect(o.calculationBasis.length).toBeGreaterThan(0);
    expect(o.debugHash).toMatch(/^lk[0-9a-f]+$/);
    expect(o.transitSummary.yearPillar).toBeTruthy();
    expect(o.periodInsights.mainTheme).toBeTruthy();
  });

  it("focusArea=study 时学习权重提高", () => {
    const o = generateLuckOverview({
      baziResult: getBazi(),
      targetDate: anchor,
      period: "day",
      focusArea: "study",
    });
    const study = o.scores.find((s) => s.category === "study")!;
    expect(study.summary).toContain("学习");
  });
});
