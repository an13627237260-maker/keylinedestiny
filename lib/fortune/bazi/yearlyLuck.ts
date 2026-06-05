import type { CalculationStep } from "../shared/types";
import { STEM_ELEMENT, type FiveElement } from "./constants";
import { getSexagenary, getYearPillarIndex, pillarToString } from "./ganzhi";
import { analyzeBranchRelations } from "./branchRelations";
import type { FourPillars } from "./pillars";
import type { LuckCycleAnalysis } from "./luckCycle";
import { getTenGod } from "./tenGods";
import type { FiveElementsAnalysis } from "./fiveElements";

export interface YearlyLuckAnalysis {
  targetYear: number;
  yearPillar: string;
  yearStemTenGod: string;
  branchRelationsWithNatal: ReturnType<typeof analyzeBranchRelations>["analysis"];
  relationWithLuckCycle: string[];
  fiveElementImpact: Record<FiveElement, string>;
  focusAreaHints: Record<string, string>;
}

export function analyzeYearlyLuck(
  targetYear: number,
  pillars: FourPillars,
  fiveElements: FiveElementsAnalysis,
  luckCycle?: LuckCycleAnalysis,
  focusArea = "overall",
): { analysis: YearlyLuckAnalysis; step: CalculationStep } {
  const index = getYearPillarIndex(targetYear);
  const yearPillarObj = getSexagenary(index);
  const yearPillar = pillarToString(yearPillarObj);

  const virtualPillars: FourPillars = {
    ...pillars,
    year: yearPillarObj,
  };
  const branchRelations = analyzeBranchRelations({
    year: yearPillarObj,
    month: pillars.month,
    day: pillars.day,
    hour: pillars.hour,
  });

  const yearStemTenGod = getTenGod(pillars.day.stem, yearPillarObj.stem);
  const yearElement = STEM_ELEMENT[yearPillarObj.stem];

  const fiveElementImpact = {} as Record<FiveElement, string>;
  for (const el of Object.keys(fiveElements.weightedScores) as FiveElement[]) {
    if (el === yearElement) {
      fiveElementImpact[el] = "流年五行与自身同类，可能加强该五行相关主题";
    } else {
      fiveElementImpact[el] = "间接影响，需结合十神与合冲";
    }
  }

  const relationWithLuckCycle: string[] = [];
  if (luckCycle && luckCycle.cycles.length > 0) {
    const current = luckCycle.cycles.find(
      (c) => targetYear >= c.startYear && targetYear < c.endYear,
    );
    if (current) {
      relationWithLuckCycle.push(
        `当前处于第${current.index}步大运 ${pillarToString(current.pillar)}`,
      );
      relationWithLuckCycle.push(
        `大运十神：${current.stemTenGod}，流年十神：${yearStemTenGod}`,
      );
    }
  }

  const focusAreaHints: Record<string, string> = {
    overall: `流年${yearPillar}，十神${yearStemTenGod}，可综合观察生活各面向的变化趋势`,
    love: "关注桃花、合冲与流年十神对感情话题的可能影响",
    career: "关注官杀、印星与流年地支冲动对事业节奏的可能影响",
    wealth: "关注财星十神与五行补耗趋势",
    study: "关注印星、文昌等辅助标签",
    health: "关注五行平衡与压力标签，不作医疗判断",
  };

  const analysis: YearlyLuckAnalysis = {
    targetYear,
    yearPillar,
    yearStemTenGod,
    branchRelationsWithNatal: branchRelations.analysis,
    relationWithLuckCycle,
    fiveElementImpact,
    focusAreaHints: {
      [focusArea]: focusAreaHints[focusArea] ?? focusAreaHints.overall,
    },
  };

  return {
    analysis,
    step: {
      step: "yearly_luck",
      title: "流年分析",
      input: { targetYear, focusArea },
      method: "以立春切换年柱（options 可扩展）；分析流年与原局、大运关系",
      result: analysis as unknown as Record<string, unknown>,
      notes: ["流年解读为趋势参考，不作事件断语"],
    },
  };
}
