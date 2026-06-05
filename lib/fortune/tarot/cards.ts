import { createHash, randomBytes } from "crypto";
import type { TarotCard } from "./types";

const MAJOR_DATA: Array<[string, string, string]> = [
  ["0", "愚者", "The Fool"],
  ["1", "魔术师", "The Magician"],
  ["2", "女祭司", "The High Priestess"],
  ["3", "女皇", "The Empress"],
  ["4", "皇帝", "The Emperor"],
  ["5", "教皇", "The Hierophant"],
  ["6", "恋人", "The Lovers"],
  ["7", "战车", "The Chariot"],
  ["8", "力量", "Strength"],
  ["9", "隐士", "The Hermit"],
  ["10", "命运之轮", "Wheel of Fortune"],
  ["11", "正义", "Justice"],
  ["12", "倒吊人", "The Hanged Man"],
  ["13", "死神", "Death"],
  ["14", "节制", "Temperance"],
  ["15", "恶魔", "The Devil"],
  ["16", "高塔", "The Tower"],
  ["17", "星星", "The Star"],
  ["18", "月亮", "The Moon"],
  ["19", "太阳", "The Sun"],
  ["20", "审判", "Judgement"],
  ["21", "世界", "The World"],
];

const SUITS: Array<{ suit: "Wands" | "Cups" | "Swords" | "Pentacles"; cn: string }> = [
  { suit: "Wands", cn: "权杖" },
  { suit: "Cups", cn: "圣杯" },
  { suit: "Swords", cn: "宝剑" },
  { suit: "Pentacles", cn: "星币" },
];

const RANKS: Array<{ en: string; cn: string }> = [
  { en: "Ace", cn: "A" },
  { en: "Two", cn: "2" },
  { en: "Three", cn: "3" },
  { en: "Four", cn: "4" },
  { en: "Five", cn: "5" },
  { en: "Six", cn: "6" },
  { en: "Seven", cn: "7" },
  { en: "Eight", cn: "8" },
  { en: "Nine", cn: "9" },
  { en: "Ten", cn: "10" },
  { en: "Page", cn: "侍从" },
  { en: "Knight", cn: "骑士" },
  { en: "Queen", cn: "王后" },
  { en: "King", cn: "国王" },
];

function baseCard(
  id: string,
  nameCn: string,
  nameEn: string,
  suit: TarotCard["suit"],
  arcana: TarotCard["arcana"],
): TarotCard {
  return {
    id,
    nameCn,
    nameEn,
    suit,
    arcana,
    uprightKeywords: ["成长", "变化", "觉察"],
    reversedKeywords: ["阻滞", "内省", "调整"],
    loveMeaning: `${nameCn}在情感中提示关注当下关系动态，仅供娱乐参考。`,
    careerMeaning: `${nameCn}在事业中象征阶段主题，需结合具体行动。`,
    wealthMeaning: `${nameCn}在财务上提示态度与节奏，非投资建议。`,
    advice: "保持开放心态，结合实际情况理解牌意。",
    warning: "塔罗解读仅供娱乐，不构成决策依据。",
  };
}

export const TAROT_DECK: TarotCard[] = [];

for (const [id, cn, en] of MAJOR_DATA) {
  TAROT_DECK.push(baseCard(`major-${id}`, cn, en, "Major", "major"));
}

for (const { suit, cn: suitCn } of SUITS) {
  for (const rank of RANKS) {
    const id = `${suit.toLowerCase()}-${rank.en.toLowerCase()}`;
    TAROT_DECK.push(
      baseCard(
        id,
        `${suitCn}${rank.cn}`,
        `${rank.en} of ${suit}`,
        suit,
        "minor",
      ),
    );
  }
}

export function getCardById(id: string): TarotCard | undefined {
  return TAROT_DECK.find((c) => c.id === id);
}

export function createSeededRng(seed: string): () => number {
  let state = createHash("sha256").update(seed).digest();
  let idx = 0;
  return () => {
    if (idx >= state.length - 4) {
      state = createHash("sha256").update(state).digest();
      idx = 0;
    }
    const n =
      (state[idx] << 24) |
      (state[idx + 1] << 16) |
      (state[idx + 2] << 8) |
      state[idx + 3];
    idx += 4;
    return (n >>> 0) / 0xffffffff;
  };
}

export function drawRandomSeed(): string {
  return randomBytes(16).toString("hex");
}
