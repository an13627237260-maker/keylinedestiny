import { describe, it, expect } from "vitest";
import { computeBazi } from "@/lib/fortune/bazi";
import { calculateTransitContext } from "@/lib/fortune/luck/transitCalculator";

const INPUT = {
  gender: "male" as const,
  birthDate: "1990-05-15",
  birthTime: "10:30",
  timezone: "Asia/Shanghai",
  useTrueSolarTime: false,
  focusArea: "overall" as const,
};

describe("transitCalculator", () => {
  const bazi = computeBazi(INPUT).algorithm_result;

  it("不同日期流日干支不同", () => {
    const a = calculateTransitContext(bazi, new Date("2026-01-01"));
    const b = calculateTransitContext(bazi, new Date("2026-08-20"));
    expect(a.day.pillar).not.toBe(b.day.pillar);
  });

  it("包含流年流月流日十神", () => {
    const ctx = calculateTransitContext(bazi, new Date("2026-06-05"));
    expect(ctx.year.stemTenGod).toBeTruthy();
    expect(ctx.month.stemTenGod).toBeTruthy();
    expect(ctx.day.stemTenGod).toBeTruthy();
  });

  it("evidence 不为空", () => {
    const ctx = calculateTransitContext(bazi, new Date("2026-06-05"));
    expect(ctx.evidence.length).toBeGreaterThan(0);
  });

  it("categorySignals 含全部分项", () => {
    const ctx = calculateTransitContext(bazi, new Date("2026-06-05"));
    expect(ctx.categorySignals.love).toBeDefined();
    expect(ctx.categorySignals.wealth).toBeDefined();
    expect(ctx.categorySignals.career).toBeDefined();
    expect(ctx.categorySignals.study).toBeDefined();
    expect(ctx.categorySignals.social).toBeDefined();
  });

  it("同一日期重复计算一致", () => {
    const d = new Date("2026-06-05");
    const a = calculateTransitContext(bazi, d);
    const b = calculateTransitContext(bazi, d);
    expect(a.day.pillar).toBe(b.day.pillar);
    expect(a.categorySignals).toEqual(b.categorySignals);
  });
});
