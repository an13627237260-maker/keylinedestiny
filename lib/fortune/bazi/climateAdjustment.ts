import {
  STEM_ELEMENT,
  type EarthlyBranch,
  type FiveElement,
  type HeavenlyStem,
} from "./constants";
import type { FourPillars } from "./pillars";
import type { FiveElementsAnalysis } from "./fiveElements";
import type { DayMasterStrengthAnalysis } from "./dayMasterStrength";
import {
  stableEvidenceId,
  type EvidenceItem,
} from "../rules/evidence";

export type ElementDistribution = FiveElementsAnalysis;
export type DayMasterStrength = DayMasterStrengthAnalysis;

export interface ClimateAnalysis {
  climateType: "寒" | "热" | "燥" | "湿" | "寒湿" | "燥热" | "平和";
  regulatingElements: string[];
  usefulClimateHints: string[];
  riskHints: string[];
  reasoning: string[];
  evidence: EvidenceItem[];
  caution: string;
}

const COLD_MONTHS: EarthlyBranch[] = ["亥", "子", "丑"];
const HOT_MONTHS: EarthlyBranch[] = ["巳", "午", "未"];
const DRY_EARTH_MONTHS: EarthlyBranch[] = ["未", "戌"];

function uniq<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function hasAnyStemOrBranch(
  pillars: FourPillars,
  stems: HeavenlyStem[],
  branches: EarthlyBranch[],
): boolean {
  const allStems = [
    pillars.year.stem,
    pillars.month.stem,
    pillars.day.stem,
    pillars.hour.stem,
  ];
  const allBranches = [
    pillars.year.branch,
    pillars.month.branch,
    pillars.day.branch,
    pillars.hour.branch,
  ];
  return (
    allStems.some((stem) => stems.includes(stem)) ||
    allBranches.some((branch) => branches.includes(branch))
  );
}

function evidence(
  id: string,
  title: string,
  detail: string,
  weight = 2.2,
  relatedElements?: string[],
): EvidenceItem {
  return {
    id: stableEvidenceId(`climate-${id}`, `${title}:${detail}`),
    source: "climate",
    category: detail.includes("健康") || detail.includes("睡眠") ? "health" : "overall",
    weight,
    polarity:
      detail.includes("风险") ||
      detail.includes("波动") ||
      detail.includes("寒") ||
      detail.includes("燥")
        ? "negative"
        : "neutral",
    title,
    detail,
    relatedElements,
  };
}

function elementOver(
  distribution: ElementDistribution,
  element: FiveElement,
  threshold = 25,
): boolean {
  return distribution.percentages[element] >= threshold || distribution.strongestElement === element;
}

export function evaluateClimateAdjustment(params: {
  pillars: FourPillars;
  elementDistribution: ElementDistribution;
  dayMasterStrength: DayMasterStrength;
}): ClimateAnalysis {
  const { pillars, elementDistribution, dayMasterStrength } = params;
  const monthBranch = pillars.month.branch;
  const dayMaster = pillars.day.stem;
  const dayElement = STEM_ELEMENT[dayMaster];
  let climateType: ClimateAnalysis["climateType"] = "平和";
  const regulatingElements: string[] = [];
  const usefulClimateHints: string[] = [];
  const riskHints: string[] = [];
  const reasoning: string[] = [];
  const evidenceItems: EvidenceItem[] = [];

  if (COLD_MONTHS.includes(monthBranch)) {
    climateType = "寒湿";
    regulatingElements.push("火");
    reasoning.push(`${monthBranch}月属冬令或寒湿土，局中寒湿倾向较明显。`);
    evidenceItems.push(
      evidence(
        "cold-month",
        "寒湿月令",
        `${monthBranch}月见亥子丑寒湿气，调候先看火土与整体寒暖。`,
        2.8,
        ["火", "土", "水"],
      ),
    );
  }

  if (HOT_MONTHS.includes(monthBranch)) {
    climateType = "燥热";
    reasoning.push(`${monthBranch}月属夏令，热燥倾向较明显。`);
    evidenceItems.push(
      evidence(
        "hot-month",
        "夏令燥热",
        `${monthBranch}月火气当令，调候需观察水金能否润燥制热。`,
        2.6,
        ["水", "金", "火"],
      ),
    );
    if (elementOver(elementDistribution, "火") || elementOver(elementDistribution, "土")) {
      regulatingElements.push("水", "金");
      usefulClimateHints.push("巳午未月若火土偏旺，水金调节倾向增强。");
      riskHints.push("热燥过重时，做事易急，作息与降温节奏要更稳。");
    }
  }

  if (monthBranch === "辰") {
    climateType = climateType === "平和" ? "湿" : climateType;
    regulatingElements.push("火", "土");
    reasoning.push("辰月为湿土带木，需注意湿滞与土木交杂。");
    evidenceItems.push(
      evidence("chen", "辰月湿土", "辰月湿土带木，调候看湿滞能否被火土梳理。", 2),
    );
  }

  if (DRY_EARTH_MONTHS.includes(monthBranch)) {
    climateType = monthBranch === "未" && climateType === "燥热" ? "燥热" : "燥";
    regulatingElements.push("水", "木");
    reasoning.push(`${monthBranch}月燥土明显，水木调节倾向增强。`);
    evidenceItems.push(
      evidence(
        "dry-earth",
        "燥土月令",
        `${monthBranch}月燥土较明，宜看水木是否能润燥疏土。`,
        2.3,
        ["水", "木", "土"],
      ),
    );
  }

  if (monthBranch === "丑") {
    climateType = "寒湿";
    regulatingElements.push("火");
    usefulClimateHints.push("丑月寒湿土，火调候倾向增强。");
    evidenceItems.push(
      evidence("chou", "丑月寒湿土", "丑月为寒湿土，火为较重要的调候方向。", 2.5, ["火"]),
    );
  }

  if (COLD_MONTHS.includes(monthBranch)) {
    if (dayMaster === "庚" || dayMaster === "辛") {
      regulatingElements.push("火");
      usefulClimateHints.push("金寒水冷，火为重要调候倾向。");
    }
    if (dayMaster === "丙" || dayMaster === "丁") {
      regulatingElements.push("木", "火");
      usefulClimateHints.push("火弱受寒，木火扶助倾向增强。");
    }
    if (dayMaster === "壬" || dayMaster === "癸") {
      regulatingElements.push("火", "土");
      usefulClimateHints.push("水寒，火土调候倾向增强。");
    }
  }

  if (dayMaster === "庚" && monthBranch === "子") {
    const special =
      "庚金生于子月，水旺寒重。判断重点不只是金强金弱，还要看寒暖调候。";
    reasoning.push(special);
    regulatingElements.push("火");
    usefulClimateHints.push("火为重要调候倾向。");
    evidenceItems.push(
      evidence("geng-zi", "庚金子月", special, 3.4, ["金", "水", "火"]),
    );

    if (hasAnyStemOrBranch(pillars, ["丙", "丁"], ["巳", "午"])) {
      const detail = "原局见丙、丁、巳或午，火为关键调候力量。";
      usefulClimateHints.push(detail);
      evidenceItems.push(evidence("fire-seen", "见火调候", detail, 3, ["火"]));
    }

    if (pillars.day.branch === "午" && pillars.month.branch === "子") {
      const detail =
        "日支午被月支子冲，火被冲动，关系、事业压力、睡眠与情绪节奏容易波动。";
      riskHints.push(detail);
      evidenceItems.push(evidence("zi-wu", "子午冲动火", detail, 3, ["火", "水"]));
    }
  }

  if (dayElement === "火" && COLD_MONTHS.includes(monthBranch)) {
    riskHints.push("火日主遇寒湿月令，行动力和精神热度宜靠规律作息与支持系统维持。");
  }

  if (elementOver(elementDistribution, "水") && climateType.includes("寒")) {
    riskHints.push("水势与寒湿叠加时，情绪节奏、精力恢复和行动启动宜放慢观察。");
  }

  reasoning.push(
    `日主强弱为${dayMasterStrength.strengthLevel}，调候只补充寒热燥湿视角，不替代日主强弱。`,
  );

  if (!evidenceItems.length) {
    reasoning.push("未见显著寒热燥湿偏颇，以平和处理。");
    evidenceItems.push(
      evidence("balanced", "调候平和", "月令未见明显寒热燥湿偏颇，调候按平和参考。", 1.5),
    );
  }

  return {
    climateType,
    regulatingElements: uniq(regulatingElements),
    usefulClimateHints: uniq(usefulClimateHints),
    riskHints: uniq(riskHints),
    reasoning: uniq(reasoning),
    evidence: evidenceItems,
    caution: "调候分析为寒热燥湿倾向的简化模型，不等同于专业命理师最终定用神。",
  };
}
