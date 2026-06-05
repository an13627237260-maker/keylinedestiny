import type { CalculationStep } from "../shared/types";
import {
  BRANCH_ELEMENT,
  ELEMENT_CONTROLS,
  ELEMENT_GENERATES,
  STEM_ELEMENT,
  STEM_YIN_YANG,
  type FiveElement,
  type HeavenlyStem,
} from "./constants";
import type { HiddenStemEntry } from "./hiddenStems";
import type { FourPillars } from "./pillars";

export type TenGod =
  | "比肩"
  | "劫财"
  | "食神"
  | "伤官"
  | "偏财"
  | "正财"
  | "七杀"
  | "正官"
  | "偏印"
  | "正印";

export function getTenGod(dayMaster: HeavenlyStem, target: HeavenlyStem): TenGod {
  const dmElement = STEM_ELEMENT[dayMaster];
  const targetElement = STEM_ELEMENT[target];
  const samePolarity = STEM_YIN_YANG[dayMaster] === STEM_YIN_YANG[target];

  if (dmElement === targetElement) {
    return samePolarity ? "比肩" : "劫财";
  }
  if (ELEMENT_GENERATES[dmElement] === targetElement) {
    return samePolarity ? "食神" : "伤官";
  }
  if (ELEMENT_CONTROLS[dmElement] === targetElement) {
    return samePolarity ? "偏财" : "正财";
  }
  if (ELEMENT_CONTROLS[targetElement] === dmElement) {
    return samePolarity ? "七杀" : "正官";
  }
  if (ELEMENT_GENERATES[targetElement] === dmElement) {
    return samePolarity ? "偏印" : "正印";
  }
  return "比肩";
}

export interface TenGodsAnalysis {
  dayMaster: HeavenlyStem;
  pillarStemGods: Record<string, TenGod>;
  hiddenStemGods: Array<{ branch: string; stem: HeavenlyStem; god: TenGod; weight: number }>;
  counts: Record<TenGod, number>;
  dominantTendency: TenGod[];
  evidence: string[];
}

export function analyzeTenGods(
  pillars: FourPillars,
  hiddenStems: Record<string, HiddenStemEntry[]>,
): { analysis: TenGodsAnalysis; step: CalculationStep } {
  const dayMaster = pillars.day.stem;
  const pillarStemGods: Record<string, TenGod> = {
    year: getTenGod(dayMaster, pillars.year.stem),
    month: getTenGod(dayMaster, pillars.month.stem),
    day: "比肩",
    hour: getTenGod(dayMaster, pillars.hour.stem),
  };

  const hiddenStemGods: TenGodsAnalysis["hiddenStemGods"] = [];
  const counts = {} as Record<TenGod, number>;

  const initCounts = (): void => {
    const gods: TenGod[] = [
      "比肩", "劫财", "食神", "伤官", "偏财", "正财", "七杀", "正官", "偏印", "正印",
    ];
    for (const g of gods) counts[g] = 0;
  };
  initCounts();

  for (const [key, god] of Object.entries(pillarStemGods)) {
    if (key !== "day") counts[god] += 1;
  }

  for (const [branch, entries] of Object.entries(hiddenStems)) {
    for (const entry of entries) {
      const god = getTenGod(dayMaster, entry.stem);
      hiddenStemGods.push({
        branch,
        stem: entry.stem,
        god,
        weight: entry.weight,
      });
      counts[god] += entry.weight;
    }
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const dominantTendency = sorted.slice(0, 3).map(([g]) => g as TenGod);
  const evidence = [
    `日主为${dayMaster}，以日干为基准推导其他天干与藏干十神。`,
    `四柱天干十神：${Object.entries(pillarStemGods).map(([key, god]) => `${key}:${god}`).join("、")}。`,
    `地支藏干十神按藏干权重计入，月支${pillars.month.branch}主五行为${BRANCH_ELEMENT[pillars.month.branch]}。`,
    `主导十神倾向：${dominantTendency.join("、")}。`,
  ];

  const analysis: TenGodsAnalysis = {
    dayMaster,
    pillarStemGods,
    hiddenStemGods,
    counts,
    dominantTendency,
    evidence,
  };

  return {
    analysis,
    step: {
      step: "ten_gods",
      title: "十神分析",
      input: { dayMaster },
      method: "以日干为日主，按五行生克与阴阳定十神",
      result: analysis as unknown as Record<string, unknown>,
      notes: ["十神计数含藏干加权", ...evidence],
    },
  };
}
