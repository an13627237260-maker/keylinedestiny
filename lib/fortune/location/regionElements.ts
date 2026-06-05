import type { ChinaRegion, ElementBias } from "./types";

const BASE_BIAS: ElementBias = {
  wood: 0,
  fire: 0,
  earth: 0,
  metal: 0,
  water: 0,
};

const REGION_DELTAS: Record<ChinaRegion, Partial<ElementBias>> = {
  north: { water: 0.25, metal: 0.1, fire: -0.1 },
  south: { fire: 0.25, wood: 0.1, water: -0.05 },
  east: { wood: 0.2, water: 0.1 },
  west: { metal: 0.2, earth: 0.1, wood: -0.05 },
  central: { earth: 0.25, fire: 0.05 },
  northeast: { water: 0.2, metal: 0.15, fire: -0.1 },
  northwest: { metal: 0.25, earth: 0.2, water: -0.05 },
  southwest: { earth: 0.2, wood: 0.15, water: 0.05 },
  southeast: { wood: 0.2, water: 0.15, fire: 0.05 },
};

export const CHINA_STANDARD_LONGITUDE = 120;

export function computeElementBias(region: ChinaRegion): ElementBias {
  const delta = REGION_DELTAS[region];
  return {
    wood: BASE_BIAS.wood + (delta.wood ?? 0),
    fire: BASE_BIAS.fire + (delta.fire ?? 0),
    earth: BASE_BIAS.earth + (delta.earth ?? 0),
    metal: BASE_BIAS.metal + (delta.metal ?? 0),
    water: BASE_BIAS.water + (delta.water ?? 0),
  };
}

export function describeRegionElementBias(bias: ElementBias): string {
  const entries = (
    [
      ["木", bias.wood],
      ["火", bias.fire],
      ["土", bias.earth],
      ["金", bias.metal],
      ["水", bias.water],
    ] as const
  )
    .filter(([, v]) => Math.abs(v) >= 0.08)
    .sort((a, b) => b[1] - a[1])
    .map(([el, v]) => `${el}${v > 0 ? "偏旺" : "偏弱"}(${v > 0 ? "+" : ""}${v.toFixed(2)})`);

  if (!entries.length) return "地域气候五行倾向较均衡，仅作环境节奏参考。";
  return `地域气候五行辅助倾向：${entries.join("、")}。此为环境参考，不替代命局五行判断。`;
}

/** 地域五行对运势评分的最大调整幅度（分） */
export const LOCATION_LUCK_SCORE_MAX_DELTA = 3;

export function computeLocationLuckDelta(
  bias: ElementBias,
  usefulElements: string[],
  avoidElements: string[],
): number {
  const elMap: Record<string, keyof ElementBias> = {
    木: "wood",
    火: "fire",
    土: "earth",
    金: "metal",
    水: "water",
  };
  let delta = 0;
  for (const el of usefulElements) {
    const key = elMap[el];
    if (key && bias[key] > 0) delta += bias[key] * 4;
  }
  for (const el of avoidElements) {
    const key = elMap[el];
    if (key && bias[key] > 0.1) delta -= bias[key] * 3;
  }
  return Math.max(
    -LOCATION_LUCK_SCORE_MAX_DELTA,
    Math.min(LOCATION_LUCK_SCORE_MAX_DELTA, Math.round(delta)),
  );
}
