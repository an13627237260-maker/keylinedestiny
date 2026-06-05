import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { calculateLuckCycle } from "@/lib/fortune/bazi/luckCycle";
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
    expect(analysis.cycles.every((cycle) => cycle.startAge >= 0)).toBe(true);
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
