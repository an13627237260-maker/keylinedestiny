import { DateTime } from "luxon";
import type { CalculationStep } from "../shared/types";
import { STEM_YIN_YANG, type HeavenlyStem } from "./constants";
import { getSexagenary, pillarToString, type Pillar } from "./ganzhi";
import type { FourPillars } from "./pillars";
import { findCurrentSolarTermInterval } from "./solarTerms";
import { getTenGod } from "./tenGods";

export interface LuckCycleEntry {
  index: number;
  pillar: Pillar;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  stemTenGod: string;
  interpretationTags: string[];
}

export interface LuckCycleAnalysis {
  direction: "forward" | "backward" | "unknown";
  startAge: number;
  startDateApprox: string;
  cycles: LuckCycleEntry[];
  currentCycle?: LuckCycleEntry;
  warnings: string[];
}

function isYangYear(stem: HeavenlyStem): boolean {
  return STEM_YIN_YANG[stem] === "阳";
}

function shouldForward(
  gender: "male" | "female" | "unknown",
  yearStem: HeavenlyStem,
): boolean | null {
  if (gender === "unknown") return null;
  const yangYear = isYangYear(yearStem);
  if (gender === "male") return yangYear;
  return !yangYear;
}

function advancePillar(pillar: Pillar, steps: number): Pillar {
  return getSexagenary((pillar.index + steps + 60) % 60);
}

export function calculateLuckCycle(
  birthDateTime: DateTime,
  timezone: string,
  gender: "male" | "female" | "unknown",
  pillars: FourPillars,
  birthYear: number,
  cycleCount = 8,
): { analysis: LuckCycleAnalysis; step: CalculationStep } {
  const warnings: string[] = [];
  const forward = shouldForward(gender, pillars.year.stem);

  if (forward === null) {
    return {
      analysis: {
        direction: "unknown",
        startAge: 0,
        startDateApprox: "",
        cycles: [],
        currentCycle: undefined,
        warnings: ["gender unknown，不计算大运"],
      },
      step: {
        step: "luck_cycle",
        title: "大运分析",
        input: { gender },
        method: "阳年男/阴年女顺排；阴年男/阳年女逆排",
        result: { skipped: true },
        notes: ["需提供性别以计算大运"],
      },
    };
  }

  const direction: "forward" | "backward" = forward ? "forward" : "backward";
  const interval = findCurrentSolarTermInterval(
    birthDateTime,
    birthDateTime.year,
    timezone,
  );
  const targetTerm =
    direction === "forward" ? interval.next : interval.previous;

  if (!targetTerm) {
    warnings.push("未找到目标节气，起运年龄使用近似值");
  }

  const termTime = targetTerm?.dateTime ?? birthDateTime;
  const diffDays = Math.abs(termTime.diff(birthDateTime, "days").days);
  const diffHoursRemainder =
    Math.abs(termTime.diff(birthDateTime, "hours").hours) % 24;

  const years = diffDays / 3;
  const months = (diffDays % 3) * 4;
  const days = (diffHoursRemainder / 2) * 10;
  const startAge = Math.round((years + months / 12 + days / 365) * 10) / 10;

  const startDateApprox =
    birthDateTime
      .plus({
        years: Math.floor(startAge),
        months: Math.round((startAge % 1) * 12),
      })
      .toISODate() ?? "";

  const monthPillar = pillars.month;
  const cycles: LuckCycleEntry[] = [];
  const stepSign = direction === "forward" ? 1 : -1;

  for (let i = 0; i < cycleCount; i++) {
    const offset = stepSign * (i + 1);
    const properPillar = advancePillar(monthPillar, offset);
    const ageStart = Math.round((startAge + i * 10) * 10) / 10;

    cycles.push({
      index: i + 1,
      pillar: properPillar,
      startAge: ageStart,
      endAge: ageStart + 10,
      startYear: birthYear + Math.floor(ageStart),
      endYear: birthYear + Math.floor(ageStart + 10),
      stemTenGod: getTenGod(pillars.day.stem, properPillar.stem),
      interpretationTags: [`第${i + 1}步大运`],
    });
  }

  const analysis: LuckCycleAnalysis = {
    direction,
    startAge,
    startDateApprox,
    cycles,
    currentCycle: cycles.find((cycle) => {
      const currentYear = DateTime.now().setZone(timezone).year;
      return currentYear >= cycle.startYear && currentYear <= cycle.endYear;
    }),
    warnings,
  };

  return {
    analysis,
    step: {
      step: "luck_cycle",
      title: "大运分析",
      input: {
        birthDateTime: birthDateTime.toISO(),
        gender,
        yearStem: pillars.year.stem,
      },
      method:
        "顺逆由性别与年干阴阳定；起运：三天折一年；从月柱顺/逆排，每步10年",
      result: {
        direction,
        startAge,
        startDateApprox,
        targetTerm: targetTerm?.name ?? null,
        daysToTerm: diffDays,
        firstCycle: cycles[0] ? pillarToString(cycles[0].pillar) : null,
        currentCycle: analysis.currentCycle
          ? {
              pillar: pillarToString(analysis.currentCycle.pillar),
              startYear: analysis.currentCycle.startYear,
              endYear: analysis.currentCycle.endYear,
              stemTenGod: analysis.currentCycle.stemTenGod,
            }
          : null,
      },
      notes: warnings,
    },
  };
}
