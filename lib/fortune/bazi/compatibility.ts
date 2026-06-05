import type { CalculationStep } from "../shared/types";
import type { BaziInput } from "../shared/validation";
import {
  ELEMENT_CONTROLS,
  ELEMENT_GENERATES,
  type EarthlyBranch,
} from "./constants";
import { computeBazi } from "./index";
import { analyzeBranchRelations, type BranchRelation } from "./branchRelations";
import { analyzeStemRelations, type StemRelation } from "./stemRelations";
import { getTenGod, type TenGod } from "./tenGods";
import { getZodiacSign } from "../zodiac/zodiac";
import {
  inferEvidencePolarity,
  stableEvidenceId,
  type EvidenceItem,
  type EvidenceSource,
} from "../rules/evidence";

export interface LoveCompatibilityResult {
  matchScore: number;
  attractionPoints: string[];
  conflictPoints: string[];
  complementaryElements: string[];
  communicationAdvice: string[];
  longTermPotential: string;
  personA: { pillars: string; dayMaster: string };
  personB: { pillars: string; dayMaster: string };
  partnerStarStatus: Array<{ person: "A" | "B"; stars: TenGod[]; count: number; note: string }>;
  evidence: {
    attractionPoints: EvidenceItem[];
    conflictPoints: EvidenceItem[];
    advice: EvidenceItem[];
  };
  zodiacAuxiliary: { signA: string; signB: string; note: string };
}

const BRANCH_RELATION_PAIRS: Array<{
  type: "六合" | "六冲" | "六害";
  pair: [EarthlyBranch, EarthlyBranch];
  description: string;
  score: number;
}> = [
  { type: "六合", pair: ["子", "丑"], description: "子丑六合土", score: 6 },
  { type: "六合", pair: ["寅", "亥"], description: "寅亥六合木", score: 6 },
  { type: "六合", pair: ["卯", "戌"], description: "卯戌六合火", score: 6 },
  { type: "六合", pair: ["辰", "酉"], description: "辰酉六合金", score: 6 },
  { type: "六合", pair: ["巳", "申"], description: "巳申六合水", score: 6 },
  { type: "六合", pair: ["午", "未"], description: "午未六合土", score: 6 },
  { type: "六冲", pair: ["子", "午"], description: "子午冲", score: -7 },
  { type: "六冲", pair: ["丑", "未"], description: "丑未冲", score: -7 },
  { type: "六冲", pair: ["寅", "申"], description: "寅申冲", score: -7 },
  { type: "六冲", pair: ["卯", "酉"], description: "卯酉冲", score: -7 },
  { type: "六冲", pair: ["辰", "戌"], description: "辰戌冲", score: -7 },
  { type: "六冲", pair: ["巳", "亥"], description: "巳亥冲", score: -7 },
  { type: "六害", pair: ["子", "未"], description: "子未害", score: -4 },
  { type: "六害", pair: ["丑", "午"], description: "丑午害", score: -4 },
  { type: "六害", pair: ["寅", "巳"], description: "寅巳害", score: -4 },
  { type: "六害", pair: ["卯", "辰"], description: "卯辰害", score: -4 },
  { type: "六害", pair: ["申", "亥"], description: "申亥害", score: -4 },
  { type: "六害", pair: ["酉", "戌"], description: "酉戌害", score: -4 },
];

function pairMatches(
  a: EarthlyBranch,
  b: EarthlyBranch,
  pair: [EarthlyBranch, EarthlyBranch],
): boolean {
  return (a === pair[0] && b === pair[1]) || (a === pair[1] && b === pair[0]);
}

function ev(
  title: string,
  detail: string,
  weight: number,
  relatedRelations?: string[],
  source: EvidenceSource = "score_model",
): EvidenceItem {
  return {
    id: stableEvidenceId("love", `${title}:${detail}`),
    source,
    category: "love",
    weight,
    polarity: inferEvidencePolarity(detail),
    title,
    detail,
    relatedRelations,
  };
}

function addPoint(
  bucket: string[],
  evidenceBucket: EvidenceItem[],
  text: string,
  evidence: EvidenceItem,
): void {
  bucket.push(text);
  evidenceBucket.push(evidence);
}

function dayBranchRelation(
  a: EarthlyBranch,
  b: EarthlyBranch,
): { text: string; score: number; evidence: EvidenceItem; positive: boolean } | null {
  if (a === b) {
    return {
      text: "日支相同，生活节奏可能相近",
      score: 4,
      evidence: ev("双方日支", `双方夫妻宫同为${a}，生活习惯与反应节奏有相近倾向`, 2.2, [a], "branch_relation"),
      positive: true,
    };
  }
  const relation = BRANCH_RELATION_PAIRS.find((item) => pairMatches(a, b, item.pair));
  if (!relation) return null;
  const positive = relation.score > 0;
  return {
    text: `双方日支${relation.description}`,
    score: relation.score,
    evidence: ev(
      "双方夫妻宫",
      `甲方日支${a}与乙方日支${b}形成${relation.description}`,
      Math.abs(relation.score) / 2,
      [relation.type],
      "branch_relation",
    ),
    positive,
  };
}

function relationEvidenceFromBranch(rel: BranchRelation): EvidenceItem {
  return ev(
    rel.type,
    `${rel.description}，涉及地支${rel.branches.join("")}，confidence=${rel.confidence}`,
    rel.confidence / 35,
    [rel.type],
    "branch_relation",
  );
}

function relationEvidenceFromStem(rel: StemRelation): EvidenceItem {
  return {
    id: stableEvidenceId("love-stem", `${rel.type}:${rel.stems.join("")}`),
    source: "stem_relation",
    category: "love",
    weight: 2,
    polarity: rel.type === "合" ? "positive" : "negative",
    title: rel.type === "合" ? "双方天干五合" : "双方天干相冲",
    detail:
      rel.type === "合"
        ? `双方天干${rel.stems.join("")}合${rel.result ?? ""}`
        : `双方天干${rel.stems.join("冲")}`,
    relatedRelations: [rel.type],
  };
}

function partnerStars(gender: BaziInput["gender"]): TenGod[] {
  if (gender === "male") return ["正财", "偏财"];
  if (gender === "female") return ["正官", "七杀"];
  return [];
}

export function analyzeLoveCompatibility(
  personA: BaziInput,
  personB: BaziInput,
): {
  result: LoveCompatibilityResult;
  steps: CalculationStep[];
} {
  const baziA = computeBazi(personA);
  const baziB = computeBazi(personB);

  const dayA = baziA.algorithm_result.pillars.day;
  const dayB = baziB.algorithm_result.pillars.day;
  const elA = baziA.algorithm_result.dayMasterStrength.dayMasterElement;
  const elB = baziB.algorithm_result.dayMasterStrength.dayMasterElement;

  const attractionPoints: string[] = [];
  const conflictPoints: string[] = [];
  const complementaryElements: string[] = [];
  const attractionEvidence: EvidenceItem[] = [];
  const conflictEvidence: EvidenceItem[] = [];
  const adviceEvidence: EvidenceItem[] = [];
  let score = 50;

  if (elA === elB) {
    const evidence = ev("日主同类", `双方日主五行同为${elA}，容易在表达方式上产生共鸣`, 2.2, [elA], "five_elements");
    addPoint(attractionPoints, attractionEvidence, "日主五行同类，易有共鸣", evidence);
    score += 8;
  }
  if (ELEMENT_GENERATES[elA] === elB || ELEMENT_GENERATES[elB] === elA) {
    const detail = `${elA}与${elB}存在相生关系，互动中有互补和支持倾向`;
    addPoint(attractionPoints, attractionEvidence, "日主五行相生，有互补倾向", ev("日主相生", detail, 2.6, [`${elA}生${elB}`], "five_elements"));
    complementaryElements.push(`${elA}生${elB}或${elB}生${elA}`);
    score += 12;
  }
  if (ELEMENT_CONTROLS[elA] === elB || ELEMENT_CONTROLS[elB] === elA) {
    addPoint(
      conflictPoints,
      conflictEvidence,
      "日主五行相克，相处可能需要更多磨合",
      ev("日主相克", `${elA}与${elB}存在相克关系，互动中更需要边界和沟通`, 2.4, [`${elA}克${elB}`], "five_elements"),
    );
    score -= 8;
  }

  const dayRel = dayBranchRelation(dayA.branch, dayB.branch);
  if (dayRel) {
    if (dayRel.positive) {
      addPoint(attractionPoints, attractionEvidence, dayRel.text, dayRel.evidence);
    } else {
      addPoint(conflictPoints, conflictEvidence, dayRel.text, dayRel.evidence);
    }
    score += dayRel.score;
  }

  const crossBranches = analyzeBranchRelations({
    year: baziA.algorithm_result.pillars.year,
    month: baziB.algorithm_result.pillars.month,
    day: dayA,
    hour: dayB,
  });

  for (const combo of crossBranches.analysis.combinations) {
    addPoint(
      attractionPoints,
      attractionEvidence,
      `地支${combo.type}：${combo.branches.join("")}`,
      relationEvidenceFromBranch(combo),
    );
    score += 4;
  }
  for (const meeting of crossBranches.analysis.meetings.filter((r) => r.confidence >= 55)) {
    addPoint(
      attractionPoints,
      attractionEvidence,
      `地支${meeting.description}`,
      relationEvidenceFromBranch(meeting),
    );
    score += meeting.confidence === 90 ? 5 : 2;
  }
  for (const clash of crossBranches.analysis.clashes) {
    addPoint(
      conflictPoints,
      conflictEvidence,
      `地支${clash.type}：${clash.branches.join("")}`,
      relationEvidenceFromBranch(clash),
    );
    score -= 5;
  }
  for (const harm of crossBranches.analysis.harms) {
    addPoint(
      conflictPoints,
      conflictEvidence,
      `地支${harm.type}：${harm.branches.join("")}`,
      relationEvidenceFromBranch(harm),
    );
    score -= 3;
  }

  const stemCross = analyzeStemRelations({
    year: baziA.algorithm_result.pillars.year,
    month: baziB.algorithm_result.pillars.month,
    day: dayA,
    hour: dayB,
  });

  for (const c of stemCross.analysis.combinations) {
    addPoint(attractionPoints, attractionEvidence, `天干五合：${c.stems.join("")}`, relationEvidenceFromStem(c));
    score += 4;
  }
  for (const c of stemCross.analysis.clashes) {
    addPoint(conflictPoints, conflictEvidence, `天干相冲：${c.stems.join("")}`, relationEvidenceFromStem(c));
    score -= 4;
  }

  const partnerStarStatus = [
    {
      person: "A" as const,
      stars: partnerStars(personA.gender),
      count: partnerStars(personA.gender).reduce(
        (sum, god) => sum + (baziA.algorithm_result.tenGods.counts[god] ?? 0),
        0,
      ),
      note: "伴侣星只作亲密关系主题参考",
    },
    {
      person: "B" as const,
      stars: partnerStars(personB.gender),
      count: partnerStars(personB.gender).reduce(
        (sum, god) => sum + (baziB.algorithm_result.tenGods.counts[god] ?? 0),
        0,
      ),
      note: "伴侣星只作亲密关系主题参考",
    },
  ];

  for (const status of partnerStarStatus) {
    if (status.stars.length && status.count > 0) {
      addPoint(
        attractionPoints,
        attractionEvidence,
        `${status.person}方伴侣星有显现，亲密关系主题较容易被看见`,
        ev("伴侣星", `${status.person}方${status.stars.join("、")}计数 ${status.count.toFixed(1)}`, 1.8, status.stars, "ten_gods"),
      );
      score += 2;
    }
  }

  const relationStars = ["桃花", "红鸾", "天喜"];
  for (const [label, bazi] of [["A", baziA], ["B", baziB]] as const) {
    const found = bazi.algorithm_result.symbolicStars.filter(
      (star) => relationStars.includes(star.name) && star.found,
    );
    for (const star of found) {
      addPoint(
        attractionPoints,
        attractionEvidence,
        `${label}方见${star.name}，社交与情感表达有辅助标签`,
        {
          id: stableEvidenceId("love-star", `${label}:${star.name}:${star.positions.join(",")}`),
          source: "symbolic_star",
          category: "love",
          weight: 1.4,
          polarity: "neutral",
          title: `${label}方${star.name}`,
          detail: `${star.name}位于${star.positions.join("、")}；${star.caution}`,
        },
      );
    }
  }

  score = Math.max(20, Math.min(90, Math.round(score)));

  if (!attractionPoints.length) {
    addPoint(
      attractionPoints,
      attractionEvidence,
      "双方未见特别强的吸引标签，适合从现实沟通中慢慢建立默契",
      ev("吸引标签", "日主、日支、天干地支未形成高权重吸引关系", 1.2),
    );
  }
  if (!conflictPoints.length) {
    addPoint(
      conflictPoints,
      conflictEvidence,
      "未见特别强的冲突标签，仍需留意现实沟通习惯",
      ev("冲突标签", "双方日支、天干地支未形成高权重冲害关系", 1.2),
    );
  }

  const communicationAdvice = [
    "关注彼此沟通节奏，尊重差异",
    "将命理倾向当作了解相处模式的参考，而非定论",
    score < 50
      ? "存在较多冲突标签时，建议更多耐心与边界感"
      : "可发挥互补优势，同时保留个人空间",
  ];
  adviceEvidence.push(
    ev("相处建议", `匹配分 ${score}，吸引证据 ${attractionEvidence.length} 条，摩擦证据 ${conflictEvidence.length} 条`, 2.4),
    ...(score < 50 ? conflictEvidence : attractionEvidence).slice(0, 2),
  );

  const signA = getZodiacSign(personA.birthDate);
  const signB = getZodiacSign(personB.birthDate);

  const result: LoveCompatibilityResult = {
    matchScore: score,
    attractionPoints,
    conflictPoints,
    complementaryElements,
    communicationAdvice,
    longTermPotential:
      "长期相处取决于沟通、选择与共同经营，命理只提示可能的相处模式与风险点",
    personA: {
      pillars: Object.values(baziA.algorithm_result.pillarStrings).join(" "),
      dayMaster: baziA.algorithm_result.pillars.day.stem,
    },
    personB: {
      pillars: Object.values(baziB.algorithm_result.pillarStrings).join(" "),
      dayMaster: baziB.algorithm_result.pillars.day.stem,
    },
    partnerStarStatus,
    evidence: {
      attractionPoints: attractionEvidence,
      conflictPoints: conflictEvidence,
      advice: adviceEvidence,
    },
    zodiacAuxiliary: {
      signA: signA.name,
      signB: signB.name,
      note: "星座匹配仅作太阳星座娱乐辅助参考",
    },
  };

  return {
    result,
    steps: [
      ...baziA.calculation_steps.slice(0, 2),
      ...baziB.calculation_steps.slice(0, 2),
      {
        step: "love_compatibility",
        title: "情感合盘",
        input: { personA: personA.name ?? "A", personB: personB.name ?? "B" },
        method: "双方八字分别计算后，合看日主五行、夫妻宫日支、天干合冲、地支合冲刑害、伴侣星与桃花红鸾天喜辅助",
        result: {
          matchScore: score,
          attractionEvidence: attractionEvidence.length,
          conflictEvidence: conflictEvidence.length,
          partnerStarStatus,
        },
        notes: ["不输出关系结果断语；所有建议来自 evidence。"],
      },
    ],
  };
}
