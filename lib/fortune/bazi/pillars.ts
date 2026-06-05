import { DateTime } from "luxon";
import type { CalculationStep } from "../shared/types";
import {
  DAY_STEM_TO_ZI_HOUR_STEM,
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  MONTH_BRANCHES,
  YEAR_STEM_TO_YIN_MONTH_STEM,
  type EarthlyBranch,
  type HeavenlyStem,
} from "./constants";
import {
  advanceStem,
  getDayPillarIndex,
  getSexagenary,
  getYearPillarIndex,
  pillarToString,
  type Pillar,
} from "./ganzhi";
import {
  getEffectiveBaziYear,
  getLiChun,
  getMonthBranchIndex,
  type SolarTerm,
  type SolarTermContext,
} from "./solarTerms";
import type { BaziOptions } from "../shared/validation";

export interface FourPillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

const HOUR_BRANCHES_ORDER: EarthlyBranch[] = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
];

const HOUR_BRANCH_RANGES: Record<EarthlyBranch, string> = {
  子: "23:00-00:59",
  丑: "01:00-02:59",
  寅: "03:00-04:59",
  卯: "05:00-06:59",
  辰: "07:00-08:59",
  巳: "09:00-10:59",
  午: "11:00-12:59",
  未: "13:00-14:59",
  申: "15:00-16:59",
  酉: "17:00-18:59",
  戌: "19:00-20:59",
  亥: "21:00-22:59",
};

export function getHourBranch(hour: number): EarthlyBranch {
  if (hour === 23 || hour === 0) return "子";
  if (hour >= 1 && hour <= 2) return "丑";
  if (hour >= 3 && hour <= 4) return "寅";
  if (hour >= 5 && hour <= 6) return "卯";
  if (hour >= 7 && hour <= 8) return "辰";
  if (hour >= 9 && hour <= 10) return "巳";
  if (hour >= 11 && hour <= 12) return "午";
  if (hour >= 13 && hour <= 14) return "未";
  if (hour >= 15 && hour <= 16) return "申";
  if (hour >= 17 && hour <= 18) return "酉";
  if (hour >= 19 && hour <= 20) return "戌";
  return "亥";
}

function pillarFromStemBranch(stem: HeavenlyStem, branch: EarthlyBranch): Pillar {
  const stemIdx = HEAVENLY_STEMS.indexOf(stem);
  const branchIdx = EARTHLY_BRANCHES.indexOf(branch);
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stemIdx && i % 12 === branchIdx) {
      return { stem, branch, index: i };
    }
  }
  return { stem, branch, index: 0 };
}

export function getYearPillar(
  dateTime: DateTime,
  timezone: string,
  solarTermContext?: SolarTermContext,
): { pillar: Pillar; step: CalculationStep } {
  const effective = getEffectiveBaziYear(dateTime, timezone, solarTermContext);
  const liChun = getLiChun(dateTime.year, timezone, solarTermContext);
  const index = getYearPillarIndex(effective.year);
  const pillar = getSexagenary(index);

  return {
    pillar,
    step: {
      step: "year_pillar",
      title: "年柱计算",
      input: { dateTime: dateTime.toISO(), timezone },
      method: "以立春为年柱切换点；1984年为甲子年基准",
      result: {
        liChun: liChun.toISO(),
        beforeLiChun: effective.beforeLiChun,
        effectiveYear: effective.year,
        pillar: pillarToString(pillar),
        index,
      },
      notes: effective.beforeLiChun
        ? ["出生时间早于当年立春，年柱归入上一干支年。"]
        : [],
    },
  };
}

export function getMonthPillar(
  dateTime: DateTime,
  yearStem: HeavenlyStem,
  timezone: string,
  solarTermContext?: SolarTermContext,
): { pillar: Pillar; step: CalculationStep } {
  const { monthIndex, boundaryTerm, nextBoundary } = getMonthBranchIndex(
    dateTime,
    timezone,
    solarTermContext,
  );
  const monthBranch = MONTH_BRANCHES[monthIndex];
  const yinMonthStem = YEAR_STEM_TO_YIN_MONTH_STEM[yearStem];
  const monthStem = advanceStem(yinMonthStem, monthIndex);
  const pillar = pillarFromStemBranch(monthStem, monthBranch);

  return {
    pillar,
    step: {
      step: "month_pillar",
      title: "月柱计算",
      input: { dateTime: dateTime.toISO(), yearStem, timezone },
      method: "月支按十二节令；月干由年干五虎遁日起",
      result: {
        boundaryTerm: boundaryTerm.name,
        boundaryAt: boundaryTerm.dateTime.toISO(),
        nextBoundary: nextBoundary?.name ?? null,
        nextBoundaryAt: nextBoundary?.dateTime.toISO() ?? null,
        monthBranch,
        yinMonthStem,
        monthStem,
        pillar: pillarToString(pillar),
      },
      notes: [`当前处于 ${boundaryTerm.name} 之后，对应 ${monthBranch}月`],
    },
  };
}

export interface TransitMonthPillarResult {
  pillar: Pillar;
  monthBranch: EarthlyBranch;
  monthStem: HeavenlyStem;
  boundaryTerm: string;
  boundaryAt: string;
  nextBoundary: string | null;
  nextBoundaryAt: string | null;
  solarMonthIndex: number;
  evidence: string[];
}

export function getTransitMonthPillarBySolarTerm(
  dateTime: DateTime,
  yearStem: HeavenlyStem,
  timezone: string,
  solarTermContext?: SolarTermContext,
): TransitMonthPillarResult {
  const { monthIndex, boundaryTerm, nextBoundary } = getMonthBranchIndex(
    dateTime,
    timezone,
    solarTermContext,
  );
  const monthBranch = MONTH_BRANCHES[monthIndex];
  const yinMonthStem = YEAR_STEM_TO_YIN_MONTH_STEM[yearStem];
  const monthStem = advanceStem(yinMonthStem, monthIndex);
  const pillar = pillarFromStemBranch(monthStem, monthBranch);
  const next = nextBoundary as SolarTerm | null;

  return {
    pillar,
    monthBranch,
    monthStem,
    boundaryTerm: boundaryTerm.name,
    boundaryAt: boundaryTerm.dateTime.toISO() ?? "",
    nextBoundary: next?.name ?? null,
    nextBoundaryAt: next?.dateTime.toISO() ?? null,
    solarMonthIndex: monthIndex,
    evidence: [
      `流月以节气为界，当前位于${boundaryTerm.name}之后。`,
      `${boundaryTerm.name}起${monthBranch}月，月干由流年年干${yearStem}按五虎遁推得${monthStem}。`,
      next ? `下一流月边界为${next.name}。` : "未找到下一流月边界。",
    ],
  };
}

function resolveDayDate(
  dateTime: DateTime,
  options: BaziOptions,
): { year: number; month: number; day: number; advancedForZiHour: boolean } {
  let dt = dateTime;
  let advancedForZiHour = false;
  if (options.dayBoundaryMode === "ziHour" && dt.hour === 23) {
    dt = dt.plus({ days: 1 });
    advancedForZiHour = true;
  }
  return {
    year: dt.year,
    month: dt.month,
    day: dt.day,
    advancedForZiHour,
  };
}

export function getDayPillar(
  dateTime: DateTime,
  options: BaziOptions,
): { pillar: Pillar; step: CalculationStep } {
  const resolved = resolveDayDate(dateTime, options);
  const index = getDayPillarIndex(resolved.year, resolved.month, resolved.day);
  const pillar = getSexagenary(index);

  return {
    pillar,
    step: {
      step: "day_pillar",
      title: "日柱计算",
      input: {
        dateTime: dateTime.toISO(),
        dayBoundaryMode: options.dayBoundaryMode,
      },
      method:
        "儒略日算法；基准日 1984-02-02 甲子日 (JDN=2445733)；支持 midnight / ziHour 换日",
      result: {
        resolvedDate: `${resolved.year}-${String(resolved.month).padStart(2, "0")}-${String(resolved.day).padStart(2, "0")}`,
        advancedForZiHour: resolved.advancedForZiHour,
        jdnOffset: 47,
        pillar: pillarToString(pillar),
        index,
      },
      notes: resolved.advancedForZiHour
        ? ["23:00-23:59 且 dayBoundaryMode=ziHour，日柱按下一天计算。"]
        : [],
    },
  };
}

export function getHourPillar(
  dateTime: DateTime,
  dayStem: HeavenlyStem,
): { pillar: Pillar; step: CalculationStep } {
  const hour = dateTime.hour;
  const hourBranch = getHourBranch(hour);
  const branchIndex = HOUR_BRANCHES_ORDER.indexOf(hourBranch);
  const ziHourStem = DAY_STEM_TO_ZI_HOUR_STEM[dayStem];
  const hourStem = advanceStem(ziHourStem, branchIndex);
  const pillar = pillarFromStemBranch(hourStem, hourBranch);

  return {
    pillar,
    step: {
      step: "hour_pillar",
      title: "时柱计算",
      input: { dateTime: dateTime.toISO(), dayStem },
      method: "时支按时辰表；时干由日干五鼠遁日起",
      result: {
        hour,
        hourBranch,
        hourRange: HOUR_BRANCH_RANGES[hourBranch],
        ziHourStem,
        fiveRatRule: `${dayStem}日${ziHourStem}子时起`,
        hourStem,
        pillar: pillarToString(pillar),
      },
      notes: ["子时含 23:00-00:59"],
    },
  };
}

export function computeFourPillars(
  dateTime: DateTime,
  timezone: string,
  options: BaziOptions,
  solarTermContext?: SolarTermContext,
): { pillars: FourPillars; steps: CalculationStep[] } {
  const yearResult = getYearPillar(dateTime, timezone, solarTermContext);
  const monthResult = getMonthPillar(
    dateTime,
    yearResult.pillar.stem,
    timezone,
    solarTermContext,
  );
  const dayResult = getDayPillar(dateTime, options);
  const hourResult = getHourPillar(dateTime, dayResult.pillar.stem);

  return {
    pillars: {
      year: yearResult.pillar,
      month: monthResult.pillar,
      day: dayResult.pillar,
      hour: hourResult.pillar,
    },
    steps: [yearResult.step, monthResult.step, dayResult.step, hourResult.step],
  };
}

export { getYearPillarIndex };
