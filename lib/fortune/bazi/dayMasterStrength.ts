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
import { analyzeBranchRelations } from "./branchRelations";

export interface DayMasterStrengthAnalysis {
  dayMaster: HeavenlyStem;
  dayMasterElement: FiveElement;
  strengthScore: number;
  strengthLevel: "strong" | "balanced" | "weak";
  supportFactors: string[];
  weakeningFactors: string[];
  reasoning: string[];
  confidence: number;
}

function motherElement(element: FiveElement): FiveElement {
  return (Object.entries(ELEMENT_GENERATES) as [FiveElement, FiveElement][]).find(
    ([, generated]) => generated === element,
  )![0];
}

function relationToDayMaster(
  dayMasterElement: FiveElement,
  targetElement: FiveElement,
): "same" | "resource" | "output" | "wealth" | "officer" | "neutral" {
  if (targetElement === dayMasterElement) return "same";
  if (ELEMENT_GENERATES[targetElement] === dayMasterElement) return "resource";
  if (ELEMENT_GENERATES[dayMasterElement] === targetElement) return "output";
  if (ELEMENT_CONTROLS[dayMasterElement] === targetElement) return "wealth";
  if (ELEMENT_CONTROLS[targetElement] === dayMasterElement) return "officer";
  return "neutral";
}

export function analyzeDayMasterStrength(
  pillars: FourPillars,
  hiddenStems: Record<string, HiddenStemEntry[]>,
): { analysis: DayMasterStrengthAnalysis; step: CalculationStep } {
  const dayMaster = pillars.day.stem;
  const dayMasterElement = STEM_ELEMENT[dayMaster];
  const monthElement = BRANCH_ELEMENT[pillars.month.branch];
  const resourceElement = motherElement(dayMasterElement);

  let score = 50;
  const supportFactors: string[] = [];
  const weakeningFactors: string[] = [];
  const reasoning: string[] = [];
  const branchRelations = analyzeBranchRelations(pillars).analysis;

  const monthRelation = relationToDayMaster(dayMasterElement, monthElement);
  if (monthRelation === "same" || monthRelation === "resource") {
    score += 18;
    supportFactors.push("月令帮扶日主");
    reasoning.push("月支五行与日主同类或相生");
  } else if (monthRelation === "officer") {
    score -= 18;
    weakeningFactors.push("月令克泄日主");
    reasoning.push("月支五行克制日主");
  } else if (monthRelation === "output") {
    score -= 12;
    weakeningFactors.push("月令泄身");
    reasoning.push("月支为日主所生，泄出日主气势");
  } else if (monthRelation === "wealth") {
    score -= 10;
    weakeningFactors.push("月令耗身");
    reasoning.push("月支为日主所克，形成财星耗身");
  }

  const stems = [pillars.year.stem, pillars.month.stem, pillars.hour.stem];
  for (const stem of stems) {
    const el = STEM_ELEMENT[stem];
    const relation = relationToDayMaster(dayMasterElement, el);
    if (relation === "same") {
      score += 8;
      supportFactors.push(`天干${stem}比劫帮身`);
    } else if (relation === "resource") {
      score += 10;
      supportFactors.push(`天干${stem}印星生扶`);
    } else if (relation === "officer") {
      score -= 8;
      weakeningFactors.push(`天干${stem}官杀克身`);
    } else if (relation === "output") {
      score -= 6;
      weakeningFactors.push(`天干${stem}食伤泄身`);
    } else if (relation === "wealth") {
      score -= 6;
      weakeningFactors.push(`天干${stem}财星耗身`);
    }
  }

  const branchRoles = [
    { key: "year", branch: pillars.year.branch, weight: 0.8, label: "年支" },
    { key: "month", branch: pillars.month.branch, weight: 1.5, label: "月支" },
    { key: "day", branch: pillars.day.branch, weight: 1.15, label: "日支" },
    { key: "hour", branch: pillars.hour.branch, weight: 0.8, label: "时支" },
  ] as const;

  for (const item of branchRoles) {
    const { branch, weight, label } = item;
    const main = BRANCH_ELEMENT[branch];
    if (main === dayMasterElement) {
      score += 6 * weight;
      supportFactors.push(`${label}${branch}主气为日主根气`);
    }
    for (const hs of hiddenStems[branch] ?? []) {
      const el = STEM_ELEMENT[hs.stem];
      if (el === dayMasterElement) {
        score += 4 * hs.weight * weight;
        supportFactors.push(`${label}${branch}藏${hs.stem}为日主根气`);
      } else if (ELEMENT_GENERATES[el] === dayMasterElement) {
        score += 5 * hs.weight * weight;
        supportFactors.push(`${label}${branch}藏${hs.stem}印星生扶`);
      } else if (ELEMENT_CONTROLS[el] === dayMasterElement) {
        score -= 4 * hs.weight * weight;
        weakeningFactors.push(`${label}${branch}藏${hs.stem}官杀克身`);
      } else if (ELEMENT_GENERATES[dayMasterElement] === el) {
        score -= 3 * hs.weight * weight;
        weakeningFactors.push(`${label}${branch}藏${hs.stem}食伤泄身`);
      } else if (ELEMENT_CONTROLS[dayMasterElement] === el) {
        score -= 3 * hs.weight * weight;
        weakeningFactors.push(`${label}${branch}藏${hs.stem}财星耗身`);
      }
    }
  }

  for (const relation of [
    ...branchRelations.clashes,
    ...branchRelations.harms,
    ...branchRelations.punishments,
  ]) {
    const touchesRoot = relation.branches.some(
      (branch) => BRANCH_ELEMENT[branch] === dayMasterElement,
    );
    if (!touchesRoot) continue;
    const important =
      relation.pillars.includes("month") || relation.pillars.includes("day");
    const delta = relation.type === "六冲" ? (important ? -7 : -4) : important ? -4 : -2;
    score += delta;
    weakeningFactors.push(`${relation.description}影响日主根气`);
    reasoning.push(`${relation.description}涉及${relation.affectedArea.join("、")}，对根气按${Math.abs(delta)}分级扣分。`);
  }

  for (const relation of branchRelations.meetings) {
    if (relation.confidence < 90) {
      reasoning.push(`${relation.description}为倾向，未按成局大幅改变日主强弱。`);
      continue;
    }
    const supports = relation.description.includes(dayMasterElement);
    const resource = relation.description.includes(resourceElement);
    if (supports || resource) {
      score += 5;
      supportFactors.push(`${relation.description}对日主或印星有助力`);
    } else {
      score -= 3;
      weakeningFactors.push(`${relation.description}改变局中五行势，日主承压增加`);
    }
  }

  const supportScore = supportFactors.length;
  const weakenScore = weakeningFactors.length;
  reasoning.push(
    `日主${dayMaster}属${dayMasterElement}，印星元素为${resourceElement}，月令权重最高。`,
  );
  reasoning.push(
    `支持因素 ${supportScore} 项，克泄耗因素 ${weakenScore} 项，综合评分用于 strong/balanced/weak 分层。`,
  );

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
    confidence: Math.min(90, Math.max(55, 60 + Math.abs(score - 50))),
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
