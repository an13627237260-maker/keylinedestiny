import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import { computeBazi } from "@/lib/fortune/bazi";
import { getSexagenary, getDayPillarIndex, getYearPillarIndex } from "@/lib/fortune/bazi/ganzhi";
import { getDayPillar, getMonthPillar, getYearPillar } from "@/lib/fortune/bazi/pillars";
import { calculateLuckCycle } from "@/lib/fortune/bazi/luckCycle";
import { computeFourPillars } from "@/lib/fortune/bazi/pillars";

const OPTIONS = {
  dayBoundaryMode: "midnight" as const,
  solarTermSource: "builtIn" as const,
  useEquationOfTime: false,
  calendarRange: "1900-2100",
};

describe("bazi algorithm accuracy", () => {
  it("1984 年甲子基准", () => {
    expect(getSexagenary(getYearPillarIndex(1984)).stem + getSexagenary(getYearPillarIndex(1984)).branch).toBe("甲子");
    expect(getSexagenary(getDayPillarIndex(1984, 2, 2)).stem + getSexagenary(getDayPillarIndex(1984, 2, 2)).branch).toBe("甲子");
  });

  it("立春前后年柱切换", () => {
    const before = getYearPillar(DateTime.fromISO("1984-02-04T15:30:00", { zone: "Asia/Shanghai" }), "Asia/Shanghai").pillar;
    const after = getYearPillar(DateTime.fromISO("1984-02-04T17:30:00", { zone: "Asia/Shanghai" }), "Asia/Shanghai").pillar;
    expect(before.stem + before.branch).not.toBe("甲子");
    expect(after.stem + after.branch).toBe("甲子");
  });

  it("月柱节气边界", () => {
    const beforeDt = DateTime.fromISO("1984-02-04T15:30:00", { zone: "Asia/Shanghai" });
    const afterDt = DateTime.fromISO("1984-02-04T17:30:00", { zone: "Asia/Shanghai" });
    const beforeYear = getYearPillar(beforeDt, "Asia/Shanghai").pillar;
    const afterYear = getYearPillar(afterDt, "Asia/Shanghai").pillar;
    const before = getMonthPillar(beforeDt, beforeYear.stem, "Asia/Shanghai").pillar;
    const after = getMonthPillar(afterDt, afterYear.stem, "Asia/Shanghai").pillar;
    expect(before.branch).toBe("丑");
    expect(after.branch).toBe("寅");
  });

  it("23:00 子时换日", () => {
    const dt = DateTime.fromISO("1984-02-02T23:30:00", { zone: "Asia/Shanghai" });
    const midnight = getDayPillar(dt, OPTIONS).pillar;
    const ziHour = getDayPillar(dt, { ...OPTIONS, dayBoundaryMode: "ziHour" }).pillar;
    expect(midnight.index).not.toBe(ziHour.index);
  });

  it("北京真太阳时修正约 -14 分钟", () => {
    const { algorithm_result } = computeBazi({
      gender: "male",
      birthDate: "1990-05-15",
      birthTime: "10:30",
      province: "北京市",
      city: "北京市",
      timezone: "Asia/Shanghai",
      useTrueSolarTime: true,
      focusArea: "overall",
    });
    expect(algorithm_result.locationInfluence?.correctionMinutes).toBeCloseTo(-14.37, 1);
  });

  it("乌鲁木齐真太阳时修正约 -129 分钟", () => {
    const { algorithm_result } = computeBazi({
      gender: "male",
      birthDate: "1990-05-15",
      birthTime: "10:30",
      province: "新疆维吾尔自治区",
      city: "乌鲁木齐市",
      timezone: "Asia/Shanghai",
      useTrueSolarTime: true,
      focusArea: "overall",
    });
    expect(algorithm_result.locationInfluence?.correctionMinutes).toBeCloseTo(-129.53, 1);
  });

  it("真太阳时跨时辰会影响时柱", () => {
    const { algorithm_result } = computeBazi({
      gender: "male",
      birthDate: "1990-05-15",
      birthTime: "02:05",
      province: "新疆维吾尔自治区",
      city: "乌鲁木齐市",
      timezone: "Asia/Shanghai",
      useTrueSolarTime: true,
      focusArea: "overall",
    });
    expect(algorithm_result.locationInfluence?.hourPillarChanged).toBe(true);
  });

  it("真太阳时跨日会影响日柱", () => {
    const { algorithm_result } = computeBazi({
      gender: "male",
      birthDate: "1990-05-15",
      birthTime: "00:30",
      province: "新疆维吾尔自治区",
      city: "乌鲁木齐市",
      timezone: "Asia/Shanghai",
      useTrueSolarTime: true,
      focusArea: "overall",
    });
    expect(algorithm_result.locationInfluence?.dayPillarChanged).toBe(true);
  });

  it("大运顺逆正确", () => {
    const dt = DateTime.fromISO("1984-05-15T10:30:00", { zone: "Asia/Shanghai" });
    const { pillars } = computeFourPillars(dt, "Asia/Shanghai", OPTIONS);
    const male = calculateLuckCycle(dt, "Asia/Shanghai", "male", pillars, 1984).analysis;
    const female = calculateLuckCycle(dt, "Asia/Shanghai", "female", pillars, 1984).analysis;
    const unknown = calculateLuckCycle(dt, "Asia/Shanghai", "unknown", pillars, 1984).analysis;
    expect(male.direction).toBe("forward");
    expect(female.direction).toBe("backward");
    expect(unknown.cycles).toHaveLength(0);
  });

  it("流年干支不同年份不同", () => {
    const a = getSexagenary(getYearPillarIndex(2025));
    const b = getSexagenary(getYearPillarIndex(2026));
    expect(a.stem + a.branch).not.toBe(b.stem + b.branch);
  });
});
