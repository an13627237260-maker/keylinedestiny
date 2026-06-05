import type { CalculationStep } from "../shared/types";
import type { EarthlyBranch, HeavenlyStem } from "./constants";
import type { FourPillars } from "./pillars";

export const GROWTH_STAGES = [
  "长生",
  "沐浴",
  "冠带",
  "临官",
  "帝旺",
  "衰",
  "病",
  "死",
  "墓",
  "绝",
  "胎",
  "养",
] as const;

export type GrowthStage = (typeof GROWTH_STAGES)[number];

/** 日干十二长生起始地支 */
const DAY_MASTER_CHANG_SHENG: Record<HeavenlyStem, EarthlyBranch> = {
  甲: "亥",
  乙: "午",
  丙: "寅",
  丁: "酉",
  戊: "寅",
  己: "酉",
  庚: "巳",
  辛: "子",
  壬: "申",
  癸: "卯",
};

const BRANCHES: EarthlyBranch[] = [
  "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥",
];

function branchIndex(b: EarthlyBranch): number {
  return BRANCHES.indexOf(b);
}

export function getGrowthStage(
  dayMaster: HeavenlyStem,
  branch: EarthlyBranch,
): GrowthStage {
  const start = DAY_MASTER_CHANG_SHENG[dayMaster];
  const offset = (branchIndex(branch) - branchIndex(start) + 12) % 12;
  return GROWTH_STAGES[offset];
}

const STAGE_TAGS: Record<GrowthStage, string> = {
  长生: "生发、起步、恢复力",
  沐浴: "变动、情绪、适应",
  冠带: "成长、学习、形象建立",
  临官: "担当、稳定输出",
  帝旺: "高峰、强势、竞争",
  衰: "收敛、调整、退潮",
  病: "疲惫、修复、内省",
  死: "结束、沉淀、转化",
  墓: "收藏、积累、守成",
  绝: "空档、转折、重启前",
  胎: "酝酿、准备、潜伏",
  养: "滋养、缓冲、培育",
};

export function analyzeTwelveGrowthStages(pillars: FourPillars): {
  stages: Record<string, { branch: EarthlyBranch; stage: GrowthStage; tag: string }>;
  dayBranchStage: GrowthStage;
  monthBranchStage: GrowthStage;
  step: CalculationStep;
} {
  const dm = pillars.day.stem;
  const keys = ["year", "month", "day", "hour"] as const;
  const stages = {} as Record<
    string,
    { branch: EarthlyBranch; stage: GrowthStage; tag: string }
  >;

  for (const k of keys) {
    const branch = pillars[k].branch;
    const stage = getGrowthStage(dm, branch);
    stages[k] = { branch, stage, tag: STAGE_TAGS[stage] };
  }

  return {
    stages,
    dayBranchStage: getGrowthStage(dm, pillars.day.branch),
    monthBranchStage: getGrowthStage(dm, pillars.month.branch),
    step: {
      step: "twelve_growth_stages",
      title: "十二长生",
      input: { dayMaster: dm },
      method: "以日干查各地支长生阶段",
      result: stages as unknown as Record<string, unknown>,
      notes: ["十二长生描述气势阶段，不作吉凶绝对判断"],
    },
  };
}
