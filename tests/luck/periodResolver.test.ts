import { describe, it, expect } from "vitest";
import { resolveLuckPeriodRange } from "@/lib/fortune/luck/periodResolver";

describe("periodResolver", () => {
  const base = new Date("2026-06-05");

  it("day 范围仅含当天", () => {
    const r = resolveLuckPeriodRange(base, "day", 0);
    expect(r.dates).toHaveLength(1);
    expect(r.startDate.getTime()).toBe(r.endDate.getTime());
  });

  it("week 为周一到周日共 7 天", () => {
    const r = resolveLuckPeriodRange(base, "week", 0);
    expect(r.dates).toHaveLength(7);
    expect(r.startDate.getDay()).toBe(1);
    expect(r.endDate.getDay()).toBe(0);
  });

  it("本周与下周 label 不同", () => {
    const thisW = resolveLuckPeriodRange(base, "week", 0);
    const nextW = resolveLuckPeriodRange(base, "week", 1);
    expect(thisW.label).not.toBe(nextW.label);
    expect(thisW.startDate.getTime()).not.toBe(nextW.startDate.getTime());
  });

  it("本月与下月范围不同", () => {
    const m0 = resolveLuckPeriodRange(base, "month", 0);
    const m1 = resolveLuckPeriodRange(base, "month", 1);
    expect(m0.startDate.getMonth()).toBe(5);
    expect(m1.startDate.getMonth()).toBe(6);
    expect(m0.dates.length).toBeGreaterThanOrEqual(5);
  });

  it("今年与去年年份不同", () => {
    const y0 = resolveLuckPeriodRange(base, "year", 0);
    const y1 = resolveLuckPeriodRange(base, "year", -1);
    expect(y0.startDate.getFullYear()).toBe(2026);
    expect(y1.startDate.getFullYear()).toBe(2025);
    expect(y0.dates.length).toBeGreaterThan(10);
  });
});
