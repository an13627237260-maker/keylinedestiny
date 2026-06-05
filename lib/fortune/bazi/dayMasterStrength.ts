import type { CalculationStep } from "../shared/types";
import {
  BRANCH_ELEMENT,
  ELEMENT_CONTROLS,
  ELEMENT_GENERATES,
  STEM_ELEMENT,
  type FiveElement,
  type HeavenlyStem,
} from "./constants";
import type { HiddenStemEntry } from "./hiddenStems";
import type { FourPillars } from "./pillars";

export interface DayMasterStrengthAnalysis {
  dayMaster: HeavenlyStem;
  dayMasterElement: FiveElement;
  strengthScore: number;
  strengthLevel: "strong" | "balanced" | "weak";
  supportFactors: string[];
  weakeningFactors: string[];
  reasoning: string[];
}

export function analyzeDayMasterStrength(
  pillars: FourPillars,
  hiddenStems: Record<string, HiddenStemEntry[]>,
): { analysis: DayMasterStrengthAnalysis; step: CalculationStep } {
  const dayMaster = pillars.day.stem;
  const dayMasterElement = STEM_ELEMENT[dayMaster];
  const monthElement = BRANCH_ELEMENT[pillars.month.branch];

  let score = 50;
  const supportFactors: string[] = [];
  const weakeningFactors: string[] = [];
  const reasoning: string[] = [];

  if (
    monthElement === dayMasterElement ||
    ELEMENT_GENERATES[monthElement] === dayMasterElement
  ) {
    score += 15;
    supportFactors.push("月令帮扶日主");
    reasoning.push("月支五行与日主同类或相生");
  } else if (ELEMENT_CONTROLS[monthElement] === dayMasterElement) {
    score -= 15;
    weakeningFactors.push("月令克泄日主");
    reasoning.push("月支五行克制日主");
  }

  const stems = [pillars.year.stem, pillars.month.stem, pillars.hour.stem];
  for (const stem of stems) {
    const el = STEM_ELEMENT[stem];
    if (el === dayMasterElement) {
      score += 8;
      supportFactors.push(`天干${stem}比劫帮身`);
    } else if (ELEMENT_GENERATES[el] === dayMasterElement) {
      score += 10;
      supportFactors.push(`天干${stem}印星生扶`);
    } else if (ELEMENT_CONTROLS[el] === dayMasterElement) {
      score -= 8;
      weakeningFactors.push(`天干${stem}官杀克身`);
    } else if (ELEMENT_CONTROLS[dayMasterElement] === el) {
      score -= 6;
      weakeningFactors.push(`天干${stem}财星耗身`);
    }
  }

  for (const branch of [pillars.year.branch, pillars.day.branch, pillars.hour.branch]) {
    const main = BRANCH_ELEMENT[branch];
    if (main === dayMasterElement) {
      score += 6;
      supportFactors.push(`地支${branch}有根`);
    }
    for (const hs of hiddenStems[branch] ?? []) {
      const el = STEM_ELEMENT[hs.stem];
      if (el === dayMasterElement) {
        score += 4 * hs.weight;
      } else if (ELEMENT_GENERATES[el] === dayMasterElement) {
        score += 5 * hs.weight;
      }
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  let strengthLevel: DayMasterStrengthAnalysis["strengthLevel"] = "balanced";
  if (score >= 65) strengthLevel = "strong";
  else if (score <= 40) strengthLevel = "weak";

  const analysis: DayMasterStrengthAnalysis = {
    dayMaster,
    dayMasterElement,
    strengthScore: score,
    strengthLevel,
    supportFactors,
    weakeningFactors,
    reasoning,
  };

  return {
    analysis,
    step: {
      step: "day_master_strength",
      title: "日主强弱",
      input: { dayMaster },
      method: "综合月令、天干帮扶、地支通根、克泄耗因素评分",
      result: analysis as unknown as Record<string, unknown>,
      notes: ["评分模型为简化参考，不代表唯一流派结论"],
    },
  };
}
