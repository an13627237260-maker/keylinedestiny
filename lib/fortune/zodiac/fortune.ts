import { createHash } from "crypto";
import type { ZodiacSignInfo } from "./zodiac";

export type FortunePeriod = "daily" | "weekly" | "monthly";

const THEMES = [
  "沟通",
  "专注",
  "休息",
  "社交",
  "学习",
  "创意",
  "整理",
  "探索",
  "合作",
  "反思",
];

const TONES = [
  "整体节奏平稳，适合按自己的步调推进。",
  "可能出现小插曲，保持弹性会更从容。",
  "适合梳理近期优先级，不必一次做完所有事。",
  "人际互动带来启发，也别忘了保留独处时间。",
  "这是娱乐型趋势参考，不代表必然发生的事件。",
];

export function generateZodiacFortune(
  sign: ZodiacSignInfo,
  period: FortunePeriod,
  date: string,
): {
  seed: string;
  themes: string[];
  summary: string;
  love: string;
  career: string;
  wellness: string;
} {
  const seed = createHash("sha256")
    .update(`${date}:${sign.id}:${period}`)
    .digest("hex");

  const pick = (offset: number, list: string[]) =>
    list[parseInt(seed.slice(offset, offset + 2), 16) % list.length];

  const themes = [
    pick(0, THEMES),
    pick(2, THEMES),
    pick(4, THEMES),
  ];

  return {
    seed,
    themes,
    summary: `${sign.name}${period === "daily" ? "今日" : period === "weekly" ? "本周" : "本月"}趋势：${pick(6, TONES)} 关键词：${themes.join("、")}。`,
    love: `感情方面可关注${themes[0]}，以轻松心态看待互动。`,
    career: `事业学习方面适合${themes[1]}，不必给自己过大压力。`,
    wellness: `身心状态方面建议${themes[2]}，保证基本休息。`,
  };
}

export function analyzeZodiacCompatibility(
  signA: ZodiacSignInfo,
  signB: ZodiacSignInfo,
): { score: number; note: string } {
  const elementScore: Record<string, number> = {
    "火火": 75,
    "火风": 80,
    "火土": 55,
    "火水": 50,
    "土土": 70,
    "土水": 65,
    "土风": 60,
    "水水": 75,
    "水风": 55,
    "风风": 72,
  };
  const key = [signA.element, signB.element].sort().join("");
  const score = elementScore[key] ?? 60;
  return {
    score,
    note: "星座匹配为娱乐辅助，不代表关系结果",
  };
}
