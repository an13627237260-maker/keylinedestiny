import type { EvidenceItem } from "../rules/evidence";
import { stableEvidenceId } from "../rules/evidence";
import {
  STEM_ELEMENT,
  type FiveElement,
} from "./constants";
import type { FourPillars } from "./pillars";
import type { FiveElementsAnalysis } from "./fiveElements";
import type { ClimateAnalysis } from "./climateAdjustment";
import type { BranchRelationsAnalysis } from "./branchRelations";

export type ElementDistribution = FiveElementsAnalysis;

export interface HealthTendencyAnalysis {
  tendencies: {
    element: FiveElement;
    theme: string;
    reason: string;
    advice: string;
    evidenceIds: string[];
  }[];
  evidence: EvidenceItem[];
  disclaimer: string;
}

const DISCLAIMER =
  "以下为命理象意上的健康倾向，不构成医学诊断。如有不适，应以专业医生检查为准。";

function ev(
  id: string,
  title: string,
  detail: string,
  element: FiveElement,
  weight = 2,
): EvidenceItem {
  return {
    id: stableEvidenceId(`health-${id}`, `${title}:${detail}`),
    source: "health_tendency",
    category: "health",
    weight,
    polarity: "negative",
    title,
    detail,
    relatedElements: [element],
  };
}

function isHigh(distribution: ElementDistribution, element: FiveElement): boolean {
  return distribution.percentages[element] >= 25 || distribution.strongestElement === element;
}

function isLow(distribution: ElementDistribution, element: FiveElement): boolean {
  return distribution.percentages[element] <= 12 || distribution.weakestElement === element;
}

function relationPressure(relations: BranchRelationsAnalysis): string {
  const count =
    relations.clashes.length +
    relations.harms.length +
    relations.breaks.length +
    relations.punishments.length;
  return count > 0 ? `并见${count}项冲刑害破关系，压力象意需温和看待。` : "";
}

export function analyzeHealthTendency(params: {
  pillars: FourPillars;
  elementDistribution: ElementDistribution;
  climate: ClimateAnalysis;
  branchRelations: BranchRelationsAnalysis;
}): HealthTendencyAnalysis {
  const { pillars, elementDistribution, climate, branchRelations } = params;
  const evidence: EvidenceItem[] = [];
  const tendencies: HealthTendencyAnalysis["tendencies"] = [];
  const pressure = relationPressure(branchRelations);

  const add = (
    id: string,
    element: FiveElement,
    theme: string,
    reason: string,
    advice: string,
    weight = 2,
  ) => {
    const item = ev(id, theme, `${reason}${pressure ? ` ${pressure}` : ""}`, element, weight);
    evidence.push(item);
    tendencies.push({
      element,
      theme,
      reason,
      advice,
      evidenceIds: [item.id],
    });
  };

  if (isHigh(elementDistribution, "火")) {
    add(
      "fire",
      "火",
      "火旺象意",
      `火占比${elementDistribution.percentages["火"].toFixed(1)}%，提示睡眠、焦躁、炎症、血压、眼睛与心火象意。`,
      "生活上宜重视规律睡眠、少熬夜、控制刺激性饮食和急躁节奏。",
      2.5,
    );
  }

  if (
    climate.climateType.includes("寒") ||
    climate.climateType.includes("湿") ||
    isHigh(elementDistribution, "水")
  ) {
    add(
      "water-cold",
      "水",
      "水旺寒湿象意",
      `气候倾向为${climate.climateType}，水占比${elementDistribution.percentages["水"].toFixed(1)}%，提示寒湿、腰肾、泌尿、情绪低落与精力下降象意。`,
      "生活上宜注意保暖、规律运动、晒太阳和减少长期潮湿寒凉环境。",
      2.6,
    );
  }

  if (isHigh(elementDistribution, "土")) {
    add(
      "earth",
      "土",
      "土重象意",
      `土占比${elementDistribution.percentages["土"].toFixed(1)}%，提示脾胃、消化、湿气、代谢、久坐与肌肉劳损象意。`,
      "生活上宜减少久坐、保持轻运动，饮食注意规律与清淡。",
      2.2,
    );
  }

  if (isHigh(elementDistribution, "木")) {
    add(
      "wood",
      "木",
      "木旺象意",
      `木占比${elementDistribution.percentages["木"].toFixed(1)}%，提示肝胆、筋骨、情绪郁结与压力疏泄象意。`,
      "生活上宜安排伸展、步行、情绪书写和稳定疏压方式。",
      2,
    );
  }

  const visibleFire = [
    pillars.year.stem,
    pillars.month.stem,
    pillars.day.stem,
    pillars.hour.stem,
  ].some((stem) => STEM_ELEMENT[stem] === "火");
  if (isLow(elementDistribution, "金") || (visibleFire && isHigh(elementDistribution, "火"))) {
    add(
      "metal",
      "金",
      "金弱或受火克象意",
      `金占比${elementDistribution.percentages["金"].toFixed(1)}%，火势对金有克制象意，提示呼吸、皮肤、防御力与肺金象意。`,
      "生活上宜保持空气流通、适度有氧、避免过度辛辣和长期熬夜。",
      2.1,
    );
  }

  if (!tendencies.length) {
    add(
      "balanced",
      elementDistribution.strongestElement,
      "健康象意平和",
      "五行未见特别突出的健康象意偏颇。",
      "维持规律作息、饮食和运动，持续观察现实身体反馈。",
      1.2,
    );
  }

  return {
    tendencies,
    evidence,
    disclaimer: DISCLAIMER,
  };
}
