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

describe("luckText variation", () => {
  const bazi = computeBazi(INPUT).algorithm_result;
  const anchor = new Date("2026-06-05");

  it("日运文案含今日或日期", () => {
    const o = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "day" });
    for (const s of o.scores) {
      expect(s.summary.length).toBeGreaterThanOrEqual(120);
      expect(s.summary.includes("今日") || s.summary.includes("2026")).toBe(true);
      expect(s.evidence.length).toBeGreaterThan(0);
    }
  });

  it("周运文案含本周", () => {
    const o = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "week" });
    const text = o.scores.map((s) => s.summary).join("");
    expect(text.includes("本周")).toBe(true);
  });

  it("月运文案含本月或流月", () => {
    const o = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "month" });
    const text = o.scores.map((s) => s.summary).join("");
    expect(text.includes("本月") || text.includes("流月")).toBe(true);
  });

  it("年运文案含年份", () => {
    const o = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "year" });
    const text = o.scores.map((s) => s.summary).join("");
    expect(text.includes("2026") || text.includes("年")).toBe(true);
  });

  it("不同周文案不完全相同", () => {
    const w0 = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "week", timelineOffset: 0 });
    const w1 = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "week", timelineOffset: 1 });
    const t0 = w0.scores.find((s) => s.category === "career")!.summary;
    const t1 = w1.scores.find((s) => s.category === "career")!.summary;
    expect(t0).not.toBe(t1);
  });

  it("evidence 每条分类至少 2 个信号来源", () => {
    const o = generateLuckOverview({ baziResult: bazi, targetDate: anchor, period: "day" });
    for (const s of o.scores) {
      expect(s.evidence.length).toBeGreaterThanOrEqual(2);
    }
  });
});
