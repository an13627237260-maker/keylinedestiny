import { describe, it, expect } from "vitest";
import { computeBazi } from "@/lib/fortune/bazi";
import {
  generateLuckOverview,
  generateAllLuckOverviews,
  getCategoryWeights,
  clampScore,
} from "@/lib/fortune/luck";
import { containsForbiddenText } from "@/lib/fortune/luck/luckText";
import type { LuckPeriod } from "@/lib/fortune/luck";

const SAMPLE_INPUT = {
  gender: "male" as const,
  birthDate: "1990-05-15",
  birthTime: "10:30",
  timezone: "Asia/Shanghai",
  useTrueSolarTime: false,
  focusArea: "overall" as const,
};

function getBazi(focusArea = "overall") {
  const { algorithm_result } = computeBazi({ ...SAMPLE_INPUT, focusArea });
  return algorithm_result;
}

const CATEGORIES = ["love", "wealth", "career", "study", "social"] as const;
const PERIODS: LuckPeriod[] = ["day", "week", "month", "year"];
const FORBIDDEN = ["一定", "必然", "注定", "包发财", "必脱单"];

describe("运势评分 luckScoring", () => {
  it("分数在 42-96 之间", () => {
    const bazi = getBazi();
    const date = new Date("2026-06-05");
    for (const period of PERIODS) {
      const overview = generateLuckOverview({ baziResult: bazi, targetDate: date, period });
      expect(overview.overallScore).toBeGreaterThanOrEqual(42);
      expect(overview.overallScore).toBeLessThanOrEqual(96);
      for (const s of overview.scores) {
        expect(s.score).toBeGreaterThanOrEqual(42);
        expect(s.score).toBeLessThanOrEqual(96);
      }
    }
  });

  it("同一个输入同一天结果一致", () => {
    const bazi = getBazi();
    const date = new Date("2026-03-15");
    const a = generateLuckOverview({ baziResult: bazi, targetDate: date, period: "day" });
    const b = generateLuckOverview({ baziResult: bazi, targetDate: date, period: "day" });
    expect(a).toEqual(b);
  });

  it("不同日期结果可以变化", () => {
    const bazi = getBazi();
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
    const allSame = CATEGORIES.every(
      (c) =>
        d1.scores.find((s) => s.category === c)?.score ===
        d2.scores.find((s) => s.category === c)?.score,
    );
    expect(allSame).toBe(false);
  });

  it("day/week/month/year 都能生成", () => {
    const bazi = getBazi();
    const all = generateAllLuckOverviews(bazi, "overall", new Date("2026-06-05"));
    expect(all.day.period).toBe("day");
    expect(all.week.period).toBe("week");
    expect(all.month.period).toBe("month");
    expect(all.year.period).toBe("year");
  });

  it("每个 LuckOverview 包含全部分项", () => {
    const bazi = getBazi();
    const overview = generateLuckOverview({
      baziResult: bazi,
      targetDate: new Date(),
      period: "month",
    });
    expect(overview.overallScore).toBeGreaterThan(0);
    for (const cat of CATEGORIES) {
      const found = overview.scores.find((s) => s.category === cat);
      expect(found).toBeDefined();
      expect(found!.label).toBeTruthy();
    }
  });

  it("文案不包含禁用词", () => {
    const bazi = getBazi();
    const all = generateAllLuckOverviews(bazi, "love", new Date("2026-06-05"));
    for (const period of PERIODS) {
      const overview = all[period];
      const texts = [
        overview.overallLevel,
        ...overview.highlights,
        ...overview.cautions,
        ...overview.scores.flatMap((s) => [s.summary, ...s.advice, ...s.evidence]),
      ];
      for (const text of texts) {
        for (const word of FORBIDDEN) {
          expect(text).not.toContain(word);
        }
        expect(containsForbiddenText(text)).toBe(false);
      }
    }
  });

  it("focusArea=study 时学习权重提高", () => {
    const normal = getCategoryWeights("overall");
    const study = getCategoryWeights("study");
    expect(study.study).toBe(0.35);
    expect(study.study).toBeGreaterThan(normal.study);
    const sum =
      study.love + study.wealth + study.career + study.study + study.social;
    expect(sum).toBeCloseTo(1, 5);
  });

  it("综合分基于分项加权（含地域辅助调整上限±3）", () => {
    const bazi = getBazi("career");
    const overview = generateLuckOverview({
      baziResult: bazi,
      targetDate: new Date("2026-06-05"),
      period: "day",
      focusArea: "career",
    });
    const weights = getCategoryWeights("career");
    let expected = 0;
    for (const cat of CATEGORIES) {
      const s = overview.scores.find((x) => x.category === cat)!.score;
      expected += s * weights[cat];
    }
    const base = clampScore(expected);
    expect(Math.abs(overview.overallScore - base)).toBeLessThanOrEqual(3);
  });
});
