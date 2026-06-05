import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import {
  calculateLuckCycle,
  calculateLuckStartConversion,
} from "@/lib/fortune/bazi/luckCycle";
import { getSexagenary } from "@/lib/fortune/bazi/ganzhi";
import type { FourPillars } from "@/lib/fortune/bazi/pillars";

const birthDateTime = DateTime.fromISO("1990-05-15T10:30:00", {
  zone: "Asia/Shanghai",
});

function pillarsForYearIndex(yearIndex: number): FourPillars {
  return {
    year: getSexagenary(yearIndex),
    month: getSexagenary(10),
    day: getSexagenary(20),
    hour: getSexagenary(30),
  };
}

describe("luckCycle direction and positioning", () => {
  it("diffDays=3 时 startAge≈1", () => {
    const c = calculateLuckStartConversion(3 * 24);
    expect(c.startAge).toBeCloseTo(1, 1);
    expect(c.equivalentYears).toBeCloseTo(1, 2);
    expect(c.equivalentMonths).toBeCloseTo(12, 2);
  });

  it("diffDays=6 时 startAge≈2", () => {
    const c = calculateLuckStartConversion(6 * 24);
    expect(c.startAge).toBeCloseTo(2, 1);
  });

  it("diffDays=1.5 时 startAge≈0.5", () => {
    const c = calculateLuckStartConversion(1.5 * 24);
    expect(c.startAge).toBeCloseTo(0.5, 1);
  });

  it("阳年男顺排", () => {
    const { analysis } = calculateLuckCycle(
      birthDateTime,
      "Asia/Shanghai",
      "male",
      pillarsForYearIndex(0),
      1990,
    );
    expect(analysis.direction).toBe("forward");
  });

  it("阴年男逆排", () => {
    const { analysis } = calculateLuckCycle(
      birthDateTime,
      "Asia/Shanghai",
      "male",
      pillarsForYearIndex(1),
      1990,
    );
    expect(analysis.direction).toBe("backward");
  });

  it("阴年女顺排", () => {
    const { analysis } = calculateLuckCycle(
      birthDateTime,
      "Asia/Shanghai",
      "female",
      pillarsForYearIndex(1),
      1990,
    );
    expect(analysis.direction).toBe("forward");
  });

  it("阳年女逆排", () => {
    const { analysis } = calculateLuckCycle(
      birthDateTime,
      "Asia/Shanghai",
      "female",
      pillarsForYearIndex(0),
      1990,
    );
    expect(analysis.direction).toBe("backward");
  });

  it("起运年龄不为负", () => {
    const { analysis } = calculateLuckCycle(
      birthDateTime,
      "Asia/Shanghai",
      "male",
      pillarsForYearIndex(0),
      1990,
    );
    expect(analysis.startAge).toBeGreaterThanOrEqual(0);
    expect(analysis.startConversion?.diffHours).toBeGreaterThanOrEqual(0);
    expect(analysis.cycles.every((cycle) => cycle.startAge >= 0)).toBe(true);
  });

  it("大运从月柱顺逆排", () => {
    const forward = calculateLuckCycle(
      birthDateTime,
      "Asia/Shanghai",
      "male",
      pillarsForYearIndex(0),
      1990,
    ).analysis;
    const backward = calculateLuckCycle(
      birthDateTime,
      "Asia/Shanghai",
      "male",
      pillarsForYearIndex(1),
      1990,
    ).analysis;
    expect(forward.cycles[0].pillar.index).toBe(11);
    expect(backward.cycles[0].pillar.index).toBe(9);
  });

  it("当前大运可根据出生年、起运年龄、当前年份定位", () => {
    const birthYear = 1990;
    const currentYear = 2026;
    const { analysis } = calculateLuckCycle(
      birthDateTime,
      "Asia/Shanghai",
      "male",
      pillarsForYearIndex(0),
      birthYear,
    );
    const current = analysis.cycles.find(
      (cycle) => currentYear >= cycle.startYear && currentYear <= cycle.endYear,
    );
    expect(current).toBeDefined();
    expect(current!.startAge).toBeLessThanOrEqual(currentYear - birthYear);
    expect(current!.endAge).toBeGreaterThanOrEqual(currentYear - birthYear);
  });

  it("gender unknown 不计算大运，只给 warning", () => {
    const { analysis } = calculateLuckCycle(
      birthDateTime,
      "Asia/Shanghai",
      "unknown",
      pillarsForYearIndex(0),
      1990,
    );
    expect(analysis.direction).toBe("unknown");
    expect(analysis.cycles).toHaveLength(0);
    expect(analysis.warnings.length).toBeGreaterThan(0);
  });
});
