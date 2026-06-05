import type { CalculationStep } from "../shared/types";
import type { EarthlyBranch } from "./constants";
import type { FourPillars } from "./pillars";

export interface BranchRelation {
  type: "六合" | "三合" | "三会" | "六冲" | "六害" | "刑";
  branches: EarthlyBranch[];
  pillars: string[];
  description: string;
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

const XING_RULES: Array<{ branches: EarthlyBranch[]; description: string }> = [
  { branches: ["子", "卯"], description: "子卯刑" },
  { branches: ["寅", "巳", "申"], description: "寅巳申三刑" },
  { branches: ["丑", "未", "戌"], description: "丑未戌三刑" },
  { branches: ["辰", "午", "酉", "亥"], description: "辰午酉亥自刑" },
];

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
        description: `合${he.element}`,
      });
      interpretationTags.push("地支六合");
    }
  }

  for (const sh of SAN_HE) {
    const present = sh.group.filter((b) => branches.includes(b));
    if (present.length >= 2) {
      meetings.push({
        type: "三合",
        branches: present,
        pillars: entries.filter((e) => present.includes(e.branch)).map((e) => e.key),
        description: `三合${sh.element}局（${present.length}/3）`,
      });
    }
  }

  for (const sh of SAN_HUI) {
    const present = sh.group.filter((b) => branches.includes(b));
    if (present.length >= 2) {
      meetings.push({
        type: "三会",
        branches: present,
        pillars: entries.filter((e) => present.includes(e.branch)).map((e) => e.key),
        description: `三会${sh.element}（${present.length}/3）`,
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
        description: "六冲",
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
        description: "六害",
      });
    }
  }

  for (const rule of XING_RULES) {
    const present = rule.branches.filter((b) => branches.includes(b));
    if (rule.branches.length === 2 && present.length === 2) {
      punishments.push({
        type: "刑",
        branches: present,
        pillars: entries.filter((e) => present.includes(e.branch)).map((e) => e.key),
        description: rule.description,
      });
    } else if (rule.branches.length >= 3 && present.length >= 2) {
      punishments.push({
        type: "刑",
        branches: present,
        pillars: entries.filter((e) => present.includes(e.branch)).map((e) => e.key),
        description: rule.description,
      });
    } else if (rule.description.includes("自刑") && present.length >= 1) {
      const self = present.filter(
        (b, _, arr) => arr.filter((x) => x === b).length >= 2 || rule.branches.includes(b),
      );
      if (self.length >= 1) {
        punishments.push({
          type: "刑",
          branches: present,
          pillars: entries.filter((e) => present.includes(e.branch)).map((e) => e.key),
          description: rule.description,
        });
      }
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
      method: "六合、三合、三会、六冲、六害、刑",
      result: analysis as unknown as Record<string, unknown>,
      notes: ["神煞与合冲仅作辅助标签，不作绝对判断"],
    },
  };
}
