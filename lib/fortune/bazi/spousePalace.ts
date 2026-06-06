import type { BaziInput } from "../shared/validation";
import {
  type EarthlyBranch,
  type HeavenlyStem,
} from "./constants";
import { BRANCH_HIDDEN_STEMS } from "./hiddenStems";
import type { FourPillars } from "./pillars";
import type { BranchRelationsAnalysis } from "./branchRelations";
import { BRANCH_BREAKS } from "./branchRelations";
import type { LuckCycleEntry } from "./luckCycle";
import type { YearlyLuckAnalysis } from "./yearlyLuck";
import {
  getTenGod,
  type TenGod,
  type TenGodsAnalysis,
} from "./tenGods";
import {
  stableEvidenceId,
  type EvidenceItem,
} from "../rules/evidence";

export type BirthInput = BaziInput;
export type TenGodAnalysis = TenGodsAnalysis;
export type AnnualLuck = YearlyLuckAnalysis;

export interface SpousePalaceAnalysis {
  spousePalace: EarthlyBranch;
  spousePalaceHiddenStems: HeavenlyStem[];
  spousePalaceTenGods: TenGod[];
  spouseStar: {
    gender: "male" | "female";
    stars: TenGod[];
    appearedInStems: boolean;
    appearedInBranches: boolean;
    appearedPositions: string[];
  };
  isClashed: boolean;
  isCombined: boolean;
  isPunished: boolean;
  isHarmed: boolean;
  isBroken: boolean;
  activatedByCurrentLuck: boolean;
  activatedByTargetYear: boolean;
  evidence: EvidenceItem[];
  summary: string;
  cautions: string[];
}

const LIU_HE: Array<[EarthlyBranch, EarthlyBranch]> = [
  ["子", "丑"],
  ["寅", "亥"],
  ["卯", "戌"],
  ["辰", "酉"],
  ["巳", "申"],
  ["午", "未"],
];

const LIU_CHONG: Array<[EarthlyBranch, EarthlyBranch]> = [
  ["子", "午"],
  ["丑", "未"],
  ["寅", "申"],
  ["卯", "酉"],
  ["辰", "戌"],
  ["巳", "亥"],
];

function pairMatch(
  a: EarthlyBranch,
  b: EarthlyBranch,
  pairs: Array<[EarthlyBranch, EarthlyBranch]>,
): boolean {
  return pairs.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
}

function relationTouchesDay(
  relation: { pillars: string[]; branches: EarthlyBranch[] },
  dayBranch: EarthlyBranch,
): boolean {
  return relation.pillars.includes("day") || relation.branches.includes(dayBranch);
}

function branchFromPillarText(pillar: string | undefined): EarthlyBranch | undefined {
  const b = pillar?.slice(-1);
  return b && "子丑寅卯辰巳午未申酉戌亥".includes(b) ? (b as EarthlyBranch) : undefined;
}

function branchActivates(a: EarthlyBranch | undefined, spousePalace: EarthlyBranch): boolean {
  if (!a) return false;
  return (
    a === spousePalace ||
    pairMatch(a, spousePalace, LIU_CHONG) ||
    pairMatch(a, spousePalace, LIU_HE) ||
    pairMatch(a, spousePalace, BRANCH_BREAKS)
  );
}

function ev(
  id: string,
  title: string,
  detail: string,
  weight = 2.2,
  polarity: EvidenceItem["polarity"] = "neutral",
  relatedRelations?: string[],
): EvidenceItem {
  return {
    id: stableEvidenceId(`spouse-${id}`, `${title}:${detail}`),
    source: "spouse_palace",
    category: "relationship",
    weight,
    polarity,
    title,
    detail,
    relatedRelations,
  };
}

function spouseStarsForGender(gender: BaziInput["gender"]): {
  normalized: "male" | "female";
  stars: TenGod[];
  caution?: string;
} {
  if (gender === "male") {
    return { normalized: "male", stars: ["正财", "偏财"] };
  }
  if (gender === "female") {
    return { normalized: "female", stars: ["正官", "七杀"] };
  }
  return {
    normalized: "female",
    stars: ["正官", "七杀"],
    caution: "性别未知时伴侣星按女命官杀临时参考，建议补充性别后复核。",
  };
}

export function analyzeSpousePalace(params: {
  input: BirthInput;
  pillars: FourPillars;
  tenGods: TenGodAnalysis;
  branchRelations: BranchRelationsAnalysis;
  currentLuck?: LuckCycleEntry;
  annualLuck?: AnnualLuck;
}): SpousePalaceAnalysis {
  const { input, pillars, tenGods, branchRelations, currentLuck, annualLuck } = params;
  const spousePalace = pillars.day.branch;
  const spousePalaceHiddenStems = BRANCH_HIDDEN_STEMS[spousePalace] ?? [];
  const spousePalaceTenGods = spousePalaceHiddenStems.map((stem) =>
    getTenGod(pillars.day.stem, stem),
  );
  const spouseStarInfo = spouseStarsForGender(input.gender);
  const spouseStars = spouseStarInfo.stars;
  const evidence: EvidenceItem[] = [
    ev(
      "palace",
      "夫妻宫",
      `日支${spousePalace}为夫妻宫，藏干${spousePalaceHiddenStems.join("、") || "无"}，对应十神${spousePalaceTenGods.join("、") || "无"}。`,
      3,
    ),
  ];

  const appearedPositions: string[] = [];
  for (const [pos, god] of Object.entries(tenGods.pillarStemGods)) {
    if (spouseStars.includes(god)) {
      appearedPositions.push(`${pos}干${god}`);
    }
  }
  for (const hidden of tenGods.hiddenStemGods) {
    if (spouseStars.includes(hidden.god)) {
      appearedPositions.push(`${hidden.branch}藏${hidden.stem}${hidden.god}`);
    }
  }

  const appearedInStems = Object.values(tenGods.pillarStemGods).some((god) =>
    spouseStars.includes(god),
  );
  const appearedInBranches = tenGods.hiddenStemGods.some((hidden) =>
    spouseStars.includes(hidden.god),
  );

  evidence.push(
    ev(
      "star",
      "伴侣星",
      `${spouseStarInfo.normalized === "female" ? "女命以官杀为伴侣星" : "男命以财星为伴侣星"}；命局出现位置：${appearedPositions.join("、") || "未见明显透出或藏支"}。`,
      2.6,
      appearedPositions.length ? "neutral" : "negative",
      spouseStars,
    ),
  );

  const dayClashes = branchRelations.clashes.filter((r) =>
    relationTouchesDay(r, spousePalace),
  );
  const dayCombines = [
    ...branchRelations.combinations,
    ...branchRelations.meetings,
  ].filter((r) => relationTouchesDay(r, spousePalace));
  const dayPunishments = branchRelations.punishments.filter((r) =>
    relationTouchesDay(r, spousePalace),
  );
  const dayHarms = branchRelations.harms.filter((r) =>
    relationTouchesDay(r, spousePalace),
  );
  const dayBreaks = branchRelations.breaks.filter((r) =>
    relationTouchesDay(r, spousePalace),
  );

  for (const r of dayClashes) {
    evidence.push(
      ev(
        `clash-${r.branches.join("")}`,
        "夫妻宫受冲",
        `日支夫妻宫参与${r.description}，关系、家庭节奏、亲密关系与安全感容易波动。`,
        3,
        "negative",
        [r.type],
      ),
    );
  }
  for (const r of dayCombines) {
    evidence.push(
      ev(
        `combine-${r.branches.join("")}`,
        "夫妻宫被合会",
        `日支夫妻宫参与${r.description}，关系议题容易被牵动。`,
        2.2,
        "neutral",
        [r.type],
      ),
    );
  }
  for (const r of dayPunishments) {
    evidence.push(
      ev(
        `punish-${r.branches.join("")}`,
        "夫妻宫见刑",
        `日支夫妻宫参与${r.description}，提示内在纠结、反复消耗或细节压力倾向。`,
        2.4,
        "negative",
        [r.type],
      ),
    );
  }
  for (const r of [...dayHarms, ...dayBreaks]) {
    evidence.push(
      ev(
        `friction-${r.type}-${r.branches.join("")}`,
        "夫妻宫细节摩擦",
        `日支夫妻宫参与${r.description}，关系中可能有误会、计划反复或细节摩擦。`,
        2.1,
        "negative",
        [r.type],
      ),
    );
  }

  const activatedByCurrentLuck = branchActivates(
    currentLuck?.pillar.branch,
    spousePalace,
  );
  const activatedByTargetYear = branchActivates(
    branchFromPillarText(annualLuck?.yearPillar),
    spousePalace,
  );

  if (activatedByCurrentLuck && currentLuck) {
    evidence.push(
      ev(
        "luck-activated",
        "大运引动夫妻宫",
        `当前大运地支${currentLuck.pillar.branch}与夫妻宫${spousePalace}形成同支、合、冲或破的引动关系。`,
        2.4,
      ),
    );
  }
  if (activatedByTargetYear && annualLuck) {
    evidence.push(
      ev(
        "year-activated",
        "流年引动夫妻宫",
        `${annualLuck.targetYear}年流年${annualLuck.yearPillar}引动夫妻宫${spousePalace}，感情关系与家庭节奏更需要被看见。`,
        2.6,
      ),
    );
  }

  const cautions = [
    "夫妻宫分析只描述关系议题的趋势与触发点，不输出婚恋事件断语。",
    "不能据此给出婚恋事件断语、出轨断语或唯一化对象判断。",
  ];
  if (spouseStarInfo.caution) cautions.push(spouseStarInfo.caution);

  const summaryParts = [
    `夫妻宫为${spousePalace}，伴侣星为${spouseStars.join("、")}。`,
    dayClashes.length
      ? "夫妻宫被冲，关系与家庭节奏容易出现波动倾向。"
      : "夫妻宫未见明显冲动，仍需结合大运流年观察触发。",
    activatedByTargetYear ? "目标流年引动夫妻宫。" : "",
  ].filter(Boolean);

  return {
    spousePalace,
    spousePalaceHiddenStems,
    spousePalaceTenGods,
    spouseStar: {
      gender: spouseStarInfo.normalized,
      stars: spouseStars,
      appearedInStems,
      appearedInBranches,
      appearedPositions,
    },
    isClashed: dayClashes.length > 0,
    isCombined: dayCombines.length > 0,
    isPunished: dayPunishments.length > 0,
    isHarmed: dayHarms.length > 0,
    isBroken: dayBreaks.length > 0,
    activatedByCurrentLuck,
    activatedByTargetYear,
    evidence,
    summary: summaryParts.join(" "),
    cautions,
  };
}
