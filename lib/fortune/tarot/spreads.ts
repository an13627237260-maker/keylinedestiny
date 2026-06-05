import type { TarotSpread } from "./types";

export const TAROT_SPREADS: TarotSpread[] = [
  {
    id: "single",
    name: "单张指引",
    description: "用一张牌观察此刻最需要关注的能量。",
    count: 1,
    positions: [
      {
        id: "current-guidance",
        name: "当前指引",
        meaning: "指出你此刻最需要关注的能量和提醒。",
      },
    ],
  },
  {
    id: "three-card",
    name: "三张牌",
    description: "从过去、现在、未来三个角度观察趋势。",
    count: 3,
    positions: [
      { id: "past", name: "过去", meaning: "影响当前状态的背景。" },
      { id: "present", name: "现在", meaning: "当下最核心的局面。" },
      { id: "future", name: "未来", meaning: "如果沿当前方向发展，可能出现的趋势。" },
    ],
  },
  {
    id: "love",
    name: "感情牌阵",
    description: "观察关系中的双方状态与相处建议。",
    count: 3,
    positions: [
      { id: "self", name: "你的状态", meaning: "你在关系中的真实感受。" },
      { id: "other", name: "关系/对方状态", meaning: "关系中的另一股能量。" },
      { id: "advice", name: "相处建议", meaning: "当前最适合的处理方式。" },
    ],
  },
  {
    id: "career",
    name: "事业牌阵",
    description: "聚焦工作目标、阻碍与下一步行动。",
    count: 3,
    positions: [
      { id: "current", name: "当前局面", meaning: "工作或目标中的现实状态。" },
      { id: "challenge", name: "阻碍因素", meaning: "目前最需要处理的问题。" },
      { id: "action", name: "行动建议", meaning: "下一步更适合的方向。" },
    ],
  },
  {
    id: "study",
    name: "学业牌阵",
    description: "观察学习状态、效率阻碍与提升方式。",
    count: 3,
    positions: [
      { id: "state", name: "学习状态", meaning: "当前学习能量。" },
      { id: "obstacle", name: "主要阻碍", meaning: "影响效率的关键因素。" },
      { id: "method", name: "提升方式", meaning: "更适合的学习策略。" },
    ],
  },
  {
    id: "yes-no",
    name: "是/否牌阵",
    description: "用一张牌给出当前倾向和提醒。",
    count: 1,
    positions: [
      { id: "tendency", name: "答案倾向", meaning: "给出问题的当前倾向和提醒。" },
    ],
  },
];

const LEGACY_SPREAD_ID_MAP: Record<string, string> = {
  threeCard: "three-card",
  yesNo: "yes-no",
};

export function normalizeTarotSpreadId(spreadId: string | undefined): string {
  if (!spreadId) return "single";
  return LEGACY_SPREAD_ID_MAP[spreadId] ?? spreadId;
}

export function getTarotSpread(spreadId: string): TarotSpread {
  const normalized = normalizeTarotSpreadId(spreadId);
  return TAROT_SPREADS.find((spread) => spread.id === normalized) ?? TAROT_SPREADS[0];
}

export function getSpreadPositions(spreadId: string): string[] {
  return getTarotSpread(spreadId).positions.map((position) => position.name);
}
