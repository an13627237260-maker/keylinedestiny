import type { CalculationStep } from "../shared/types";
import type { BaziInput } from "../shared/validation";
import { ELEMENT_CONTROLS, ELEMENT_GENERATES, STEM_ELEMENT } from "./constants";
import { computeBazi } from "./index";
import { analyzeBranchRelations } from "./branchRelations";
import { analyzeStemRelations } from "./stemRelations";
import { getZodiacSign } from "../zodiac/zodiac";

export interface LoveCompatibilityResult {
  matchScore: number;
  attractionPoints: string[];
  conflictPoints: string[];
  complementaryElements: string[];
  communicationAdvice: string[];
  longTermPotential: string;
  personA: { pillars: string; dayMaster: string };
  personB: { pillars: string; dayMaster: string };
  zodiacAuxiliary: { signA: string; signB: string; note: string };
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

  const elA = STEM_ELEMENT[baziA.algorithm_result.pillars.day.stem];
  const elB = STEM_ELEMENT[baziB.algorithm_result.pillars.day.stem];

  const attractionPoints: string[] = [];
  const conflictPoints: string[] = [];
  const complementaryElements: string[] = [];
  let score = 50;

  if (elA === elB) {
    attractionPoints.push("日主五行同类，易有共鸣");
    score += 10;
  }
  if (ELEMENT_GENERATES[elA] === elB || ELEMENT_GENERATES[elB] === elA) {
    attractionPoints.push("日主五行相生，有互补倾向");
    complementaryElements.push(`${elA}生${elB}或${elB}生${elA}`);
    score += 15;
  }
  if (ELEMENT_CONTROLS[elA] === elB || ELEMENT_CONTROLS[elB] === elA) {
    conflictPoints.push("日主五行相克，相处可能需要更多磨合");
    score -= 10;
  }

  const crossBranches = analyzeBranchRelations({
    year: baziA.algorithm_result.pillars.year,
    month: baziB.algorithm_result.pillars.month,
    day: baziA.algorithm_result.pillars.day,
    hour: baziB.algorithm_result.pillars.hour,
  });

  if (baziA.algorithm_result.pillars.day.branch === baziB.algorithm_result.pillars.day.branch) {
    attractionPoints.push("日支相同，生活节奏可能相近");
    score += 5;
  }

  for (const clash of crossBranches.analysis.clashes) {
    conflictPoints.push(`日支层面存在${clash.type}：${clash.branches.join("")}`);
    score -= 5;
  }

  for (const combo of crossBranches.analysis.combinations) {
    attractionPoints.push(`地支${combo.type}：${combo.branches.join("")}`);
    score += 5;
  }

  const stemCross = analyzeStemRelations({
    year: baziA.algorithm_result.pillars.year,
    month: baziB.algorithm_result.pillars.month,
    day: baziA.algorithm_result.pillars.day,
    hour: baziB.algorithm_result.pillars.hour,
  });

  for (const c of stemCross.analysis.combinations) {
    attractionPoints.push(`天干五合：${c.stems.join("")}`);
    score += 5;
  }
  for (const c of stemCross.analysis.clashes) {
    conflictPoints.push(`天干相冲：${c.stems.join("")}`);
    score -= 5;
  }

  const signA = getZodiacSign(personA.birthDate);
  const signB = getZodiacSign(personB.birthDate);

  score = Math.max(20, Math.min(90, score));

  const communicationAdvice = [
    "关注彼此沟通节奏，尊重差异",
    "将命理倾向当作了解相处模式的参考，而非定论",
    score < 50
      ? "存在较多冲突标签时，建议更多耐心与边界感"
      : "可发挥互补优势，同时保留个人空间",
  ];

  const result: LoveCompatibilityResult = {
    matchScore: score,
    attractionPoints,
    conflictPoints,
    complementaryElements,
    communicationAdvice,
    longTermPotential:
      "长期相处取决于沟通与选择，命理仅提示可能的相处模式与风险点",
    personA: {
      pillars: Object.values(baziA.algorithm_result.pillarStrings).join(" "),
      dayMaster: baziA.algorithm_result.pillars.day.stem,
    },
    personB: {
      pillars: Object.values(baziB.algorithm_result.pillarStrings).join(" "),
      dayMaster: baziB.algorithm_result.pillars.day.stem,
    },
    zodiacAuxiliary: {
      signA: signA.name,
      signB: signB.name,
      note: "星座匹配仅作娱乐辅助参考",
    },
  };

  return {
    result,
    steps: [
      ...baziA.calculation_steps.slice(0, 2),
      {
        step: "love_compatibility",
        title: "情感合盘",
        input: { personA: personA.name, personB: personB.name },
        method: "日主五行生克、日支合冲、天干关系、星座辅助",
        result: { matchScore: score },
        notes: ["不输出必然结婚或分手结论"],
      },
    ],
  };
}
