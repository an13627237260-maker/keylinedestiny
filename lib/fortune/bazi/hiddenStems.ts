import type { CalculationStep } from "../shared/types";
import {
  EARTHLY_BRANCHES,
  type EarthlyBranch,
  type HeavenlyStem,
} from "./constants";

export interface HiddenStemEntry {
  stem: HeavenlyStem;
  weight: number;
  role: "主气" | "中气" | "余气";
}

export const BRANCH_HIDDEN_STEMS: Record<EarthlyBranch, HeavenlyStem[]> = {
  子: ["癸"],
  丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"],
  卯: ["乙"],
  辰: ["戊", "乙", "癸"],
  巳: ["丙", "戊", "庚"],
  午: ["丁", "己"],
  未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"],
  酉: ["辛"],
  戌: ["戊", "辛", "丁"],
  亥: ["壬", "甲"],
};

function weightsForCount(count: number): number[] {
  if (count === 1) return [1.0];
  if (count === 2) return [0.7, 0.3];
  return [0.6, 0.3, 0.1];
}

const ROLES: Array<"主气" | "中气" | "余气"> = ["主气", "中气", "余气"];

export function getHiddenStems(branch: EarthlyBranch): HiddenStemEntry[] {
  const stems = BRANCH_HIDDEN_STEMS[branch];
  const weights = weightsForCount(stems.length);
  return stems.map((stem, i) => ({
    stem,
    weight: weights[i],
    role: ROLES[i],
  }));
}

export function getAllHiddenStems(
  branches: EarthlyBranch[],
): Record<EarthlyBranch, HiddenStemEntry[]> {
  const result = {} as Record<EarthlyBranch, HiddenStemEntry[]>;
  for (const branch of branches) {
    result[branch] = getHiddenStems(branch);
  }
  return result;
}

export function buildHiddenStemsStep(
  branches: EarthlyBranch[],
): CalculationStep {
  const hidden = getAllHiddenStems(branches);
  return {
    step: "hidden_stems",
    title: "地支藏干",
    input: { branches },
    method: "主气0.6/中气0.3/余气0.1；两字藏干0.7/0.3；单藏干1.0",
    result: hidden as unknown as Record<string, unknown>,
    notes: [],
  };
}
