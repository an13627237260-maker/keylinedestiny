import type { CalculationStep } from "../shared/types";
import {
  EARTHLY_BRANCHES,
  HEAVENLY_STEMS,
  MONTH_BRANCHES,
  YEAR_STEM_TO_YIN_MONTH_STEM,
  type EarthlyBranch,
  type HeavenlyStem,
} from "./constants";
import { advanceStem, getSexagenary, getYearPillarIndex } from "./ganzhi";
import type { FourPillars } from "./pillars";
import { getTenGod } from "./tenGods";

function pillarFromStemBranch(stem: HeavenlyStem, branch: EarthlyBranch) {
  const stemIdx = HEAVENLY_STEMS.indexOf(stem);
  const branchIdx = EARTHLY_BRANCHES.indexOf(branch);
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stemIdx && i % 12 === branchIdx) {
      return { stem, branch, index: i };
    }
  }
  return { stem, branch, index: 0 };
}

export interface MonthlyLuckEntry {
  month: number;
  pillar: string;
  stemTenGod: string;
  hint: string;
}

export function analyzeMonthlyLuck(
  targetYear: number,
  pillars: FourPillars,
  focusArea: string,
): { months: MonthlyLuckEntry[]; step: CalculationStep } {
  const yearStem = getSexagenary(getYearPillarIndex(targetYear)).stem;
  const yinStem = YEAR_STEM_TO_YIN_MONTH_STEM[yearStem];

  const months: MonthlyLuckEntry[] = [];
  for (let i = 0; i < 12; i++) {
    const stem = advanceStem(yinStem, i);
    const branch = MONTH_BRANCHES[i];
    const proper = `${stem}${branch}`;
    const stemTenGod = getTenGod(pillars.day.stem, stem);
    months.push({
      month: i + 1,
      pillar: proper,
      stemTenGod,
      hint: `${targetYear}年${i + 1}月流月${proper}，十神${stemTenGod}，可关注${focusArea}相关节奏变化`,
    });
  }

  return {
    months,
    step: {
      step: "monthly_luck",
      title: "流月简析",
      input: { targetYear },
      method: "流年天干五虎遁推月干，月支按正月寅起",
      result: { count: 12 },
      notes: ["流月为趋势参考"],
    },
  };
}
