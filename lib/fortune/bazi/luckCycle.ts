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

export interface LuckStartConversion {
  diffDays: number;
  diffHours: number;
  equivalentYears: number;
  equivalentMonths: number;
  equivalentDays: number;
  startAge: number;
}

export interface LuckCycleAnalysis {
  direction: "forward" | "backward" | "unknown";
  startAge: number;
  startDateApprox: string;
  startConversion?: LuckStartConversion;
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

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateLuckStartConversion(totalHours: number): LuckStartConversion {
  const safeHours = Math.max(0, Math.abs(totalHours));
  const totalDays = safeHours / 24;
  const equivalentYears = totalDays / 3;
  return {
    diffDays: round2(totalDays),
    diffHours: round2(safeHours),
    equivalentYears: round2(equivalentYears),
    equivalentMonths: round2(totalDays * 4),
    equivalentDays: round2((safeHours / 2) * 10),
    startAge: round1(equivalentYears),
  };
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
        startConversion: undefined,
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
  const diffHours = Math.abs(termTime.diff(birthDateTime, "hours").hours);
  const conversion = calculateLuckStartConversion(diffHours);
  const startAge = conversion.startAge;

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
    startConversion: conversion,
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
        targetTermAt: targetTerm?.dateTime.toISO() ?? null,
        daysToTerm: conversion.diffDays,
        diffDays: conversion.diffDays,
        diffHours: conversion.diffHours,
        equivalentYears: conversion.equivalentYears,
        equivalentMonths: conversion.equivalentMonths,
        equivalentDays: conversion.equivalentDays,
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
      notes: [
        `目标节气：${targetTerm?.name ?? "未找到"}；距离约 ${conversion.diffDays} 天；起运年龄约 ${startAge.toFixed(1)} 岁。`,
        "起运换算采用 totalDiffDays / 3，不重复叠加余数天数。",
        ...warnings,
      ],
    },
  };
}
