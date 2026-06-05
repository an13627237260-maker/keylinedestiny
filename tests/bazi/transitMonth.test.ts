import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import { computeBazi } from "@/lib/fortune/bazi";
import {
  getTransitMonthPillarBySolarTerm,
  getYearPillar,
} from "@/lib/fortune/bazi/pillars";
import { getSolarTerms } from "@/lib/fortune/bazi/solarTerms";
import { analyzeMonthlyLuck } from "@/lib/fortune/bazi/monthlyLuck";
import type { HeavenlyStem } from "@/lib/fortune/bazi/constants";

const TZ = "Asia/Shanghai";

function nearTerm(year: number, termName: string, offsetMinutes: number): DateTime {
  const term = getSolarTerms(year, TZ).find((item) => item.name === termName);
  if (!term) throw new Error(`missing term ${termName}`);
  return term.dateTime.plus({ minutes: offsetMinutes });
}

function transitAt(dateTime: DateTime) {
  const yearStem = getYearPillar(dateTime, TZ).pillar.stem;
  return getTransitMonthPillarBySolarTerm(dateTime, yearStem, TZ);
}

describe("节气流月", () => {
  it("立春后是寅月", () => {
    const result = transitAt(nearTerm(2026, "立春", 1));
    expect(result.monthBranch).toBe("寅");
    expect(result.boundaryTerm).toBe("立春");
    expect(result.evidence.join("")).toContain("节气");
  });

  it("惊蛰后是卯月", () => {
    const result = transitAt(nearTerm(2026, "惊蛰", 1));
    expect(result.monthBranch).toBe("卯");
    expect(result.boundaryTerm).toBe("惊蛰");
  });

  it("清明后是辰月", () => {
    const result = transitAt(nearTerm(2026, "清明", 1));
    expect(result.monthBranch).toBe("辰");
    expect(result.boundaryTerm).toBe("清明");
  });

  it("立春前仍属于上一节气流月", () => {
    const result = transitAt(nearTerm(2026, "立春", -1));
    expect(result.monthBranch).toBe("丑");
    expect(result.boundaryTerm).toBe("小寒");
  });

  it("公历 1 月大部分不是寅月", () => {
    const dt = DateTime.fromISO("2026-01-15T12:00:00", { zone: TZ });
    const result = transitAt(dt);
    expect(result.monthBranch).not.toBe("寅");
    expect(result.monthBranch).toBe("丑");
  });

  it("流月干支按五虎遁推导", () => {
    const result = getTransitMonthPillarBySolarTerm(
      nearTerm(2026, "立春", 1),
      "丙" as HeavenlyStem,
      TZ,
    );
    expect(result.monthStem).toBe("庚");
    expect(result.monthBranch).toBe("寅");
    expect(result.pillar.stem + result.pillar.branch).toBe("庚寅");
  });

  it("月运生成 12 个节气流月并写明起止节气", () => {
    const bazi = computeBazi({
      gender: "female",
      birthDate: "1988-08-08",
      birthTime: "08:00",
      timezone: TZ,
      useTrueSolarTime: false,
      focusArea: "overall",
    }).algorithm_result;
    const result = analyzeMonthlyLuck(2026, bazi.pillars, "overall", TZ);
    expect(result.months).toHaveLength(12);
    expect(result.months[0].boundaryTerm).toBe("立春");
    expect(result.months[0].monthBranch).toBe("寅");
    expect(result.months[0].evidence.join("")).toContain("本流月区间");
    expect(result.step.method).toContain("公历月份仅作显示辅助");
  });
});
