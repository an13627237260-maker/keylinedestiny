import { describe, expect, it } from "vitest";
import { drawTarotCards, drawTarotCardsWithSeed, TAROT_CARDS } from "@/lib/fortune/tarot";

describe("tarot draw", () => {
  it("drawTarotCards({ count: 1 }) 返回 1 张", () => {
    const drawn = drawTarotCards({ count: 1 });
    expect(drawn).toHaveLength(1);
    expect(TAROT_CARDS.some((card) => card.id === drawn[0].card.id)).toBe(true);
  });

  it("drawTarotCards({ count: 3 }) 返回 3 张且不重复", () => {
    const drawn = drawTarotCards({ count: 3 });
    expect(drawn).toHaveLength(3);
    expect(new Set(drawn.map((item) => item.card.id)).size).toBe(3);
  });

  it("支持正位和逆位字段", () => {
    const drawn = drawTarotCards({ count: 10 });
    for (const item of drawn) {
      expect(["upright", "reversed"]).toContain(item.orientation);
    }
  });

  it("count=0 抛错", () => {
    expect(() => drawTarotCards({ count: 0 })).toThrow("抽牌数量必须大于 0");
  });

  it("count>78 抛错", () => {
    expect(() => drawTarotCards({ count: 79 })).toThrow("抽牌数量不能超过牌库数量");
  });

  it("seeded 抽牌稳定且不重复", () => {
    const a = drawTarotCardsWithSeed({ count: 3, seed: "fixed-seed" });
    const b = drawTarotCardsWithSeed({ count: 3, seed: "fixed-seed" });
    expect(a.map((item) => item.card.id)).toEqual(b.map((item) => item.card.id));
    expect(new Set(a.map((item) => item.card.id)).size).toBe(3);
  });
});
