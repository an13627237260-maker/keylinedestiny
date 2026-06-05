import type { CalculationStep } from "../shared/types";
import type { EarthlyBranch } from "./constants";
import type { FourPillars } from "./pillars";

export interface BranchRelation {
  type:
    | "六合"
    | "三合"
    | "三会"
    | "六冲"
    | "六害"
    | "刑"
    | "刑势倾向"
    | "自刑";
  branches: EarthlyBranch[];
  pillars: string[];
  description: string;
  confidence: number;
  affectedArea: string[];
}

export interface BranchRelationsAnalysis {
  combinations: BranchRelation[];
  meetings: BranchRelation[];
  clashes: BranchRelation[];
  harms: BranchRelation[];
  punishments: BranchRelation[];
  interpretationTags: string[];
}

const LIU_HE: Array<{ pair: [EarthlyBranch, EarthlyBranch]; element: string }> = [
  { pair: ["子", "丑"], element: "土" },
  { pair: ["寅", "亥"], element: "木" },
  { pair: ["卯", "戌"], element: "火" },
  { pair: ["辰", "酉"], element: "金" },
  { pair: ["巳", "申"], element: "水" },
  { pair: ["午", "未"], element: "土" },
];

const SAN_HE: Array<{ group: EarthlyBranch[]; element: string }> = [
  { group: ["申", "子", "辰"], element: "水" },
  { group: ["亥", "卯", "未"], element: "木" },
  { group: ["寅", "午", "戌"], element: "火" },
  { group: ["巳", "酉", "丑"], element: "金" },
];

const SAN_HUI: Array<{ group: EarthlyBranch[]; element: string }> = [
  { group: ["寅", "卯", "辰"], element: "木" },
  { group: ["巳", "午", "未"], element: "火" },
  { group: ["申", "酉", "戌"], element: "金" },
  { group: ["亥", "子", "丑"], element: "水" },
];

const LIU_CHONG: Array<[EarthlyBranch, EarthlyBranch]> = [
  ["子", "午"],
  ["丑", "未"],
  ["寅", "申"],
  ["卯", "酉"],
  ["辰", "戌"],
  ["巳", "亥"],
];

const LIU_HAI: Array<[EarthlyBranch, EarthlyBranch]> = [
  ["子", "未"],
  ["丑", "午"],
  ["寅", "巳"],
  ["卯", "辰"],
  ["申", "亥"],
  ["酉", "戌"],
];

const SELF_PUNISHMENTS: EarthlyBranch[] = ["辰", "午", "酉", "亥"];

function pillarBranches(pillars: FourPillars): Array<{ key: string; branch: EarthlyBranch }> {
  return [
    { key: "year", branch: pillars.year.branch },
    { key: "month", branch: pillars.month.branch },
    { key: "day", branch: pillars.day.branch },
    { key: "hour", branch: pillars.hour.branch },
  ];
}

function matchPair(
  entries: Array<{ key: string; branch: EarthlyBranch }>,
  pair: [EarthlyBranch, EarthlyBranch],
): string[] | null {
  const keys: string[] = [];
  let foundA = false;
  let foundB = false;
  for (const e of entries) {
    if (e.branch === pair[0]) {
      keys.push(e.key);
      foundA = true;
    }
    if (e.branch === pair[1]) {
      keys.push(e.key);
      foundB = true;
    }
  }
  return foundA && foundB ? keys : null;
}

function uniquePresent(
  group: EarthlyBranch[],
  branches: EarthlyBranch[],
): EarthlyBranch[] {
  return group.filter((b) => branches.includes(b));
}

function keysForBranches(
  entries: Array<{ key: string; branch: EarthlyBranch }>,
  target: EarthlyBranch[],
): string[] {
  return entries.filter((e) => target.includes(e.branch)).map((e) => e.key);
}

function affectedAreas(keys: string[]): string[] {
  const map: Record<string, string> = {
    year: "外部/家族背景",
    month: "事业/环境",
    day: "感情/内在稳定",
    hour: "后期/计划",
  };
  return [...new Set(keys.map((key) => map[key] ?? key))];
}

function sanHeDescription(
  group: EarthlyBranch[],
  element: string,
  present: EarthlyBranch[],
): string {
  if (present.length === 3) return `${group.join("")}三合${element}局成局倾向`;
  const hasFirst = present.includes(group[0]);
  const hasMiddle = present.includes(group[1]);
  const hasLast = present.includes(group[2]);
  if ((hasFirst && hasMiddle) || (hasMiddle && hasLast)) {
    return `${present.join("")}半合${element}势倾向`;
  }
  return `${present.join("")}拱合${element}势倾向`;
}

function sanHuiDescription(
  group: EarthlyBranch[],
  element: string,
  present: EarthlyBranch[],
): string {
  if (present.length === 3) return `${group.join("")}三会${element}势成势`;
  return `${present.join("")}半会${element}势倾向`;
}

function countBranch(branches: EarthlyBranch[], branch: EarthlyBranch): number {
  return branches.filter((b) => b === branch).length;
}

export function analyzeBranchRelations(
  pillars: FourPillars,
): { analysis: BranchRelationsAnalysis; step: CalculationStep } {
  const entries = pillarBranches(pillars);
  const branches = entries.map((e) => e.branch);
  const combinations: BranchRelation[] = [];
  const meetings: BranchRelation[] = [];
  const clashes: BranchRelation[] = [];
  const harms: BranchRelation[] = [];
  const punishments: BranchRelation[] = [];
  const interpretationTags: string[] = [];

  for (const he of LIU_HE) {
    const keys = matchPair(entries, he.pair);
    if (keys) {
      combinations.push({
        type: "六合",
        branches: he.pair,
        pillars: keys,
        description: `${he.pair.join("")}六合${he.element}合象（未作合化定论）`,
        confidence: 75,
        affectedArea: affectedAreas(keys),
      });
      interpretationTags.push("地支六合");
    }
  }

  for (const sh of SAN_HE) {
    const present = uniquePresent(sh.group, branches);
    if (present.length >= 2) {
      meetings.push({
        type: "三合",
        branches: present,
        pillars: keysForBranches(entries, present),
        description: sanHeDescription(sh.group, sh.element, present),
        confidence: present.length === 3 ? 90 : 55,
        affectedArea: affectedAreas(keysForBranches(entries, present)),
      });
    }
  }

  for (const sh of SAN_HUI) {
    const present = uniquePresent(sh.group, branches);
    if (present.length >= 2) {
      meetings.push({
        type: "三会",
        branches: present,
        pillars: keysForBranches(entries, present),
        description: sanHuiDescription(sh.group, sh.element, present),
        confidence: present.length === 3 ? 90 : 55,
        affectedArea: affectedAreas(keysForBranches(entries, present)),
      });
    }
  }

  for (const pair of LIU_CHONG) {
    const keys = matchPair(entries, pair);
    if (keys) {
      clashes.push({
        type: "六冲",
        branches: pair,
        pillars: keys,
        description: `${pair.join("")}六冲，提示对应领域变动或对立压力`,
        confidence: 80,
        affectedArea: affectedAreas(keys),
      });
      interpretationTags.push("地支六冲");
    }
  }

  for (const pair of LIU_HAI) {
    const keys = matchPair(entries, pair);
    if (keys) {
      harms.push({
        type: "六害",
        branches: pair,
        pillars: keys,
        description: `${pair.join("")}六害，提示细节压力与内部摩擦`,
        confidence: 70,
        affectedArea: affectedAreas(keys),
      });
    }
  }

  const ziMao = matchPair(entries, ["子", "卯"]);
  if (ziMao) {
    punishments.push({
      type: "刑",
      branches: ["子", "卯"],
      pillars: ziMao,
      description: "子卯刑",
      confidence: 85,
      affectedArea: affectedAreas(ziMao),
    });
  }

  for (const group of [
    { branches: ["寅", "巳", "申"] as EarthlyBranch[], label: "寅巳申三刑" },
    { branches: ["丑", "未", "戌"] as EarthlyBranch[], label: "丑未戌三刑" },
  ]) {
    const present = uniquePresent(group.branches, branches);
    if (present.length === 3) {
      punishments.push({
        type: "刑",
        branches: present,
        pillars: keysForBranches(entries, present),
        description: `${group.label}成立`,
        confidence: 90,
        affectedArea: affectedAreas(keysForBranches(entries, present)),
      });
    } else if (present.length === 2) {
      punishments.push({
        type: "刑势倾向",
        branches: present,
        pillars: keysForBranches(entries, present),
        description: `${present.join("")}刑势倾向（${group.label}未全）`,
        confidence: 55,
        affectedArea: affectedAreas(keysForBranches(entries, present)),
      });
    }
  }

  for (const branch of SELF_PUNISHMENTS) {
    if (countBranch(branches, branch) >= 2) {
      punishments.push({
        type: "自刑",
        branches: entries
          .filter((e) => e.branch === branch)
          .map((e) => e.branch),
        pillars: entries.filter((e) => e.branch === branch).map((e) => e.key),
        description: `${branch}${branch}自刑`,
        confidence: 85,
        affectedArea: affectedAreas(entries.filter((e) => e.branch === branch).map((e) => e.key)),
      });
    }
  }

  const analysis: BranchRelationsAnalysis = {
    combinations,
    meetings,
    clashes,
    harms,
    punishments,
    interpretationTags,
  };

  return {
    analysis,
    step: {
      step: "branch_relations",
      title: "地支合冲刑害",
      input: { branches },
      method: "六合、三合/半合/拱合、三会/半会、六冲、六害、刑与自刑",
      result: analysis as unknown as Record<string, unknown>,
      notes: ["两支只输出倾向，不按三合局或三会成立处理；单个辰午酉亥不触发自刑。"],
    },
  };
}
