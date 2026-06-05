import type { CalculationStep } from "../shared/types";
import type { FiveElement } from "./constants";
import type { TenGodsAnalysis } from "./tenGods";
import type { DayMasterStrengthAnalysis } from "./dayMasterStrength";
import type { FiveElementsAnalysis } from "./fiveElements";

interface UsefulGodsInput {
  tenGods: TenGodsAnalysis;
  dayMasterStrength: DayMasterStrengthAnalysis;
  fiveElements: FiveElementsAnalysis;
}

export interface UsefulGodsAnalysis {
  usefulElementTendency: FiveElement[];
  avoidElementTendency: FiveElement[];
  regulatingElementTendency: FiveElement[];
  reasoning: string[];
  confidence: number;
  caution: string;
}

export function analyzeUsefulGods(algo: UsefulGodsInput): {
  analysis: UsefulGodsAnalysis;
  step: CalculationStep;
} {
  const dm = algo.dayMasterStrength;
  const five = algo.fiveElements;
  const tg = algo.tenGods;
  const reasoning: string[] = [];
  let useful: FiveElement[] = [];
  let avoid: FiveElement[] = [];
  let regulating: FiveElement[] = [];
  let confidence = 55;

  const generates: Record<FiveElement, FiveElement> = {
    木: "火", 火: "土", 土: "金", 金: "水", 水: "木",
  };
  const controls: Record<FiveElement, FiveElement> = {
    木: "土", 土: "水", 水: "火", 火: "金", 金: "木",
  };
  const dmEl = dm.dayMasterElement;

  if (dm.strengthLevel === "weak") {
    useful = [dmEl];
    const mother = (Object.entries(generates) as [FiveElement, FiveElement][]).find(
      ([, v]) => v === dmEl,
    )?.[0];
    if (mother) useful.push(mother);
    avoid = [controls[dmEl], generates[dmEl]].filter(Boolean) as FiveElement[];
    reasoning.push("日主偏弱，倾向印比帮身，忌过重伤官财");
    reasoning.push("病药思路：弱则先扶身，再看财官食伤能否承载。");
    confidence = 70;
  } else if (dm.strengthLevel === "strong") {
    useful = [controls[dmEl], generates[dmEl]];
    avoid = [dmEl];
    const mother = (Object.entries(generates) as [FiveElement, FiveElement][]).find(
      ([, v]) => v === dmEl,
    )?.[0];
    if (mother) avoid.push(mother);
    reasoning.push("日主偏强，倾向食伤财官泄耗制化");
    reasoning.push("病药思路：强则取泄耗制化，避免比印继续加重。");
    confidence = 68;
  } else {
    useful = five.usefulElementTendency as FiveElement[];
    reasoning.push("日主中和，喜用随大运流年与五行偏颇动态调整");
    confidence = 55;
  }

  if (five.strongestElement === "水" && five.weakestElement === "火") {
    reasoning.push("寒湿偏重时，火土调候倾向增强");
    if (!useful.includes("火")) useful.push("火");
    regulating.push("火", "土");
  }
  if (five.strongestElement === "火" && five.weakestElement === "水") {
    reasoning.push("燥热偏重时，水金调候倾向增强");
    if (!useful.includes("水")) useful.push("水");
    regulating.push("水", "金");
  }

  if ((tg.counts["七杀"] ?? 0) > 2 && (tg.counts["食神"] ?? 0) > 1) {
    reasoning.push("杀旺食现，有通关倾向：以技能与表达缓冲压力");
    const output = generates[dmEl];
    regulating.push(output);
  }

  if ((tg.counts["正官"] ?? 0) + (tg.counts["七杀"] ?? 0) > 2 && (tg.counts["正印"] ?? 0) + (tg.counts["偏印"] ?? 0) > 1) {
    reasoning.push("官杀与印星并见，印星通关倾向增强");
    const mother = (Object.entries(generates) as [FiveElement, FiveElement][]).find(
      ([, v]) => v === dmEl,
    )?.[0];
    if (mother) regulating.push(mother);
  }

  if (dm.strengthLevel === "weak" && (tg.counts["正财"] ?? 0) + (tg.counts["偏财"] ?? 0) > 3) {
    reasoning.push("财旺身弱时只记录从财可能性，未满足极端条件前不按从格定用。");
  }
  if (dm.strengthLevel === "weak" && (tg.counts["七杀"] ?? 0) > 3) {
    reasoning.push("杀重身弱时只记录从杀可能性，未满足极端条件前不按从格定用。");
  }

  useful = [...new Set(useful)].slice(0, 3);
  avoid = [...new Set(avoid)].slice(0, 3);
  regulating = [...new Set(regulating)].filter((el) => !useful.includes(el)).slice(0, 3);

  const analysis: UsefulGodsAnalysis = {
    usefulElementTendency: useful,
    avoidElementTendency: avoid,
    regulatingElementTendency: regulating,
    reasoning,
    confidence,
    caution: "当前为喜用倾向，不等同于专业命理师定用神。",
  };

  return {
    analysis,
    step: {
      step: "useful_gods",
      title: "喜用倾向分析",
      input: { strengthLevel: dm.strengthLevel },
      method: "综合日主强弱、月令、五行偏颇、十神结构、调候、通关、病药与从格可能性",
      result: analysis as unknown as Record<string, unknown>,
      notes: [analysis.caution],
    },
  };
}
