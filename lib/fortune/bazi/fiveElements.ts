import type { CalculationStep } from "../shared/types";
import {
  BRANCH_ELEMENT,
  EARTH_MONTH_BRANCHES,
  SEASON_ELEMENT_BY_MONTH_BRANCH,
  STEM_ELEMENT,
  type FiveElement,
} from "./constants";
import type { HiddenStemEntry } from "./hiddenStems";
import type { FourPillars } from "./pillars";

export interface FiveElementsAnalysis {
  rawScores: Record<FiveElement, number>;
  weightedScores: Record<FiveElement, number>;
  percentages: Record<FiveElement, number>;
  strongestElement: FiveElement;
  weakestElement: FiveElement;
  balanceScore: number;
  elementRanking: Array<{ element: FiveElement; score: number; percentage: number }>;
  explanation: string[];
  usefulElementTendency: FiveElement[];
  notes: string[];
}

export function analyzeFiveElements(
  pillars: FourPillars,
  hiddenStems: Record<string, HiddenStemEntry[]>,
): { analysis: FiveElementsAnalysis; step: CalculationStep } {
  const rawScores: Record<FiveElement, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  const stems = [
    pillars.year.stem,
    pillars.month.stem,
    pillars.day.stem,
    pillars.hour.stem,
  ];
  for (const stem of stems) {
    rawScores[STEM_ELEMENT[stem]] += 1.0;
  }

  const branches = [
    pillars.year.branch,
    pillars.month.branch,
    pillars.day.branch,
    pillars.hour.branch,
  ];
  for (const branch of branches) {
    rawScores[BRANCH_ELEMENT[branch]] += 1.2;
    for (const hs of hiddenStems[branch] ?? []) {
      rawScores[STEM_ELEMENT[hs.stem]] += hs.weight;
    }
  }

  const seasonElement = SEASON_ELEMENT_BY_MONTH_BRANCH[pillars.month.branch];
  const weightedScores = { ...rawScores };
  const notes: string[] = [];

  for (const el of Object.keys(weightedScores) as FiveElement[]) {
    if (el === seasonElement) {
      weightedScores[el] *= 1.3;
      notes.push(`${el}当令 ×1.3`);
    }
  }

  const generates = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" } as const;
  const controls = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" } as const;
  weightedScores[generates[seasonElement]] *= 1.1;
  weightedScores[controls[seasonElement]] *= 0.9;

  if (EARTH_MONTH_BRANCHES.includes(pillars.month.branch)) {
    weightedScores["土"] *= 1.2;
    notes.push("季月土气另加 ×1.2");
  }

  const total = Object.values(weightedScores).reduce((a, b) => a + b, 0);
  const percentages = {} as Record<FiveElement, number>;
  for (const el of Object.keys(weightedScores) as FiveElement[]) {
    percentages[el] = total > 0 ? Math.round((weightedScores[el] / total) * 1000) / 10 : 0;
  }

  const sorted = (Object.entries(weightedScores) as [FiveElement, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  const strongestElement = sorted[0][0];
  const weakestElement = sorted[sorted.length - 1][0];
  const elementRanking = sorted.map(([element, score]) => ({
    element,
    score: Number(score.toFixed(2)),
    percentage: percentages[element],
  }));

  const ideal = total / 5;
  const variance =
    Object.values(weightedScores).reduce((acc, v) => acc + Math.abs(v - ideal), 0) / 5;
  const balanceScore = Math.max(0, Math.round(100 - (variance / ideal) * 20));

  const usefulElementTendency = sorted.slice(-2).map(([el]) => el);
  const explanation = [
    "天干按每柱 1.0 计入原始分。",
    "地支主五行按每支 1.2 计入原始分。",
    "藏干按单藏 1.0、双藏 0.7/0.3、三藏 0.6/0.3/0.1 加权。",
    `月令${pillars.month.branch}对应${seasonElement}当令，参与季节权重修正。`,
    "五行平衡只描述结构分布，不使用“缺什么补什么”的直接断语。",
  ];

  const analysis: FiveElementsAnalysis = {
    rawScores,
    weightedScores,
    percentages,
    strongestElement,
    weakestElement,
    balanceScore,
    elementRanking,
    explanation,
    usefulElementTendency,
    notes: [
      ...notes,
      ...explanation,
      "喜用神倾向仅供参考，不代表绝对判断。",
      "weakestElement 不等于喜用神。",
    ],
  };

  return {
    analysis,
    step: {
      step: "five_elements",
      title: "五行强弱",
      input: { monthBranch: pillars.month.branch },
      method: "天干1.0、地支主五行1.2、藏干加权；季节与季土修正",
      result: analysis as unknown as Record<string, unknown>,
      notes: analysis.notes,
    },
  };
}
