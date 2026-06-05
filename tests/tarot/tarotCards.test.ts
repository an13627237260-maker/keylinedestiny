import { describe, expect, it } from "vitest";
import { TAROT_CARDS } from "@/lib/fortune/tarot";

describe("tarot cards", () => {
  it("内置完整 78 张塔罗牌", () => {
    expect(TAROT_CARDS.length).toBe(78);
  });

  it("每张牌 id 唯一", () => {
    const ids = TAROT_CARDS.map((card) => card.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("每张牌字段完整", () => {
    for (const card of TAROT_CARDS) {
      expect(card.nameCn.trim()).not.toBe("");
      expect(card.nameEn.trim()).not.toBe("");
      expect(card.uprightKeywords.length).toBeGreaterThan(0);
      expect(card.reversedKeywords.length).toBeGreaterThan(0);
      expect(card.uprightMeaning.trim()).not.toBe("");
      expect(card.reversedMeaning.trim()).not.toBe("");
      expect(card.loveMeaning.trim()).not.toBe("");
      expect(card.careerMeaning.trim()).not.toBe("");
      expect(card.wealthMeaning.trim()).not.toBe("");
      expect(card.studyMeaning.trim()).not.toBe("");
      expect(card.advice.trim()).not.toBe("");
      expect(card.warning.trim()).not.toBe("");
      expect(JSON.stringify(card)).not.toContain("暂无");
    }
  });

  it("包含指定的大阿尔卡那与四组小阿尔卡那", () => {
    expect(TAROT_CARDS.some((card) => card.id === "major-fool" && card.nameEn === "The Fool")).toBe(true);
    expect(TAROT_CARDS.some((card) => card.nameCn === "世界" && card.nameEn === "The World")).toBe(true);
    expect(TAROT_CARDS.filter((card) => card.suit === "wands")).toHaveLength(14);
    expect(TAROT_CARDS.filter((card) => card.suit === "cups")).toHaveLength(14);
    expect(TAROT_CARDS.filter((card) => card.suit === "swords")).toHaveLength(14);
    expect(TAROT_CARDS.filter((card) => card.suit === "pentacles")).toHaveLength(14);
  });
});
