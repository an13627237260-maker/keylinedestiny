import { DateTime } from "luxon";
import type { CalculationStep } from "../shared/types";
import {
  MONTH_BRANCHES,
  YEAR_STEM_TO_YIN_MONTH_STEM,
  type EarthlyBranch,
  type HeavenlyStem,
} from "./constants";
import { advanceStem, getSexagenary, getYearPillarIndex, pillarToString } from "./ganzhi";
import type { FourPillars } from "./pillars";
import { getTransitMonthPillarBySolarTerm } from "./pillars";
import { getSolarTerms, type SolarTermContext } from "./solarTerms";
import { getTenGod } from "./tenGods";

const DEFAULT_TIMEZONE = "Asia/Shanghai";
const MONTH_JIE_NAMES = [
  "立春",
  "惊蛰",
  "清明",
  "立夏",
  "芒种",
  "小暑",
  "立秋",
  "白露",
  "寒露",
  "立冬",
  "大雪",
  "小寒",
] as const;

export interface MonthlyLuckEntry {
  month: number;
  solarMonthIndex: number;
  calendarMonthHint: number;
  pillar: string;
  monthBranch: EarthlyBranch;
  monthStem: HeavenlyStem;
  stemTenGod: string;
  boundaryTerm: string;
  boundaryAt: string;
  nextBoundary: string;
  nextBoundaryAt: string;
  evidence: string[];
  hint: string;
}

function boundaryAt(
  year: number,
  termName: string,
  timezone: string,
  context?: SolarTermContext,
): DateTime {
  const terms = getSolarTerms(year, timezone, context);
  const term = terms.find((item) => item.name === termName);
  if (!term) {
    throw new Error(`缺少节气 ${year} ${termName}`);
  }
  return term.dateTime;
}

function solarMonthBoundaries(
  targetYear: number,
  timezone: string,
  context?: SolarTermContext,
): Array<{ name: string; dateTime: DateTime }> {
  const out = MONTH_JIE_NAMES.slice(0, 11).map((name) => ({
    name,
    dateTime: boundaryAt(targetYear, name, timezone, context),
  }));
  out.push({
    name: "小寒",
    dateTime: boundaryAt(targetYear + 1, "小寒", timezone, context),
  });
  out.push({
    name: "立春",
    dateTime: boundaryAt(targetYear + 1, "立春", timezone, context),
  });
  return out;
}

export function analyzeMonthlyLuck(
  targetYear: number,
  pillars: FourPillars,
  focusArea: string,
  timezone = DEFAULT_TIMEZONE,
  solarTermContext?: SolarTermContext,
): { months: MonthlyLuckEntry[]; step: CalculationStep } {
  const yearStem = getSexagenary(getYearPillarIndex(targetYear)).stem;
  const yinStem = YEAR_STEM_TO_YIN_MONTH_STEM[yearStem];
  const boundaries = solarMonthBoundaries(targetYear, timezone, solarTermContext);

  const months: MonthlyLuckEntry[] = [];
  for (let i = 0; i < 12; i++) {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    const anchor = start.dateTime.plus({ minutes: 1 });
    const transit = getTransitMonthPillarBySolarTerm(
      anchor,
      yearStem,
      timezone,
      solarTermContext,
    );
    const expectedBranch = MONTH_BRANCHES[i];
    const expectedStem = advanceStem(yinStem, i);
    const stemTenGod = getTenGod(pillars.day.stem, transit.monthStem);
    const pillar = pillarToString(transit.pillar);
    months.push({
      month: i + 1,
      solarMonthIndex: transit.solarMonthIndex,
      calendarMonthHint: start.dateTime.month,
      pillar,
      monthBranch: transit.monthBranch,
      monthStem: transit.monthStem,
      stemTenGod,
      boundaryTerm: start.name,
      boundaryAt: start.dateTime.toISO() ?? "",
      nextBoundary: end.name,
      nextBoundaryAt: end.dateTime.toISO() ?? "",
      evidence: [
        ...transit.evidence,
        `本流月区间：${start.name}（${start.dateTime.toFormat("yyyy-MM-dd HH:mm")}）至${end.name}（${end.dateTime.toFormat("yyyy-MM-dd HH:mm")}）。`,
        `校验：第${i + 1}个节气流月应为${expectedBranch}月，五虎遁月干应为${expectedStem}。`,
      ],
      hint: `${targetYear}年第${i + 1}个节气流月${pillar}（${start.name}至${end.name}），十神${stemTenGod}，可关注${focusArea}相关节奏变化。`,
    });
  }

  return {
    months,
    step: {
      step: "monthly_luck",
      title: "流月简析",
      input: { targetYear, timezone },
      method: "流月以节气为界；立春起寅月，月干按流年年干五虎遁推导；公历月份仅作显示辅助",
      result: {
        count: months.length,
        months: months.map((month) => ({
          pillar: month.pillar,
          boundaryTerm: month.boundaryTerm,
          boundaryAt: month.boundaryAt,
          nextBoundary: month.nextBoundary,
          nextBoundaryAt: month.nextBoundaryAt,
          calendarMonthHint: month.calendarMonthHint,
        })),
      },
      notes: ["流月为节气流月趋势参考，不使用公历月份直接替代。"],
    },
  };
}
