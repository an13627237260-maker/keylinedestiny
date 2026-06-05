import type { TarotSpreadType } from "./types";

export const SPREAD_POSITIONS: Record<TarotSpreadType, string[]> = {
  single: ["核心指引"],
  threeCard: ["过去", "现在", "未来"],
  love: ["自我", "对方", "关系", "障碍", "建议"],
  career: ["现状", "挑战", "机会", "建议"],
  yesNo: ["倾向", "原因", "建议"],
};

export function getSpreadPositions(spread: TarotSpreadType): string[] {
  return SPREAD_POSITIONS[spread];
}
