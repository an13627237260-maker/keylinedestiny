import { describe, expect, it } from "vitest";
import { generateTarotReading } from "@/lib/fortune/tarot";

function chineseLength(text: string): number {
  return (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
}

describe("tarot reading", () => {
  it("single 返回 1 张", () => {
    const reading = generateTarotReading({ spreadId: "single" });
    expect(reading.cards).toHaveLength(1);
    expect(reading.question).toBe("我当前需要关注什么？");
  });

  it("three-card 返回 3 张", () => {
    const reading = generateTarotReading({ spreadId: "three-card" });
    expect(reading.cards).toHaveLength(3);
    expect(reading.spread.id).toBe("three-card");
  });

  it("love 返回 3 张", () => {
    const reading = generateTarotReading({ spreadId: "love", focusArea: "love" });
    expect(reading.cards).toHaveLength(3);
    expect(reading.cards.map((item) => item.position.id)).toEqual(["self", "other", "advice"]);
  });

  it("空 question 也能生成", () => {
    const reading = generateTarotReading({});
    expect(reading.question).toBeTruthy();
    expect(reading.summary).toContain(reading.question);
  });

  it("每张 drawn card 有 interpretation", () => {
    const reading = generateTarotReading({ spreadId: "career", focusArea: "career" });
    for (const card of reading.cards) {
      expect(card.interpretation.trim()).not.toBe("");
      expect(card.interpretation).toContain(card.position.name);
      expect(card.interpretation).toContain(card.card.nameCn);
    }
  });

  it("summary、advice、cautions 完整", () => {
    const reading = generateTarotReading({ spreadId: "study", focusArea: "study" });
    expect(chineseLength(reading.summary)).toBeGreaterThanOrEqual(80);
    expect(reading.advice.length).toBeGreaterThanOrEqual(3);
    expect(reading.cautions.length).toBeGreaterThanOrEqual(2);
    expect(reading.disclaimer).toContain("塔罗结果基于本地牌库与规则生成，仅供娱乐和自我反思参考，不构成现实决策依据。");
  });

  it("randomTrace 记录抽牌信息", () => {
    const reading = generateTarotReading({ spreadId: "yes-no" });
    expect(reading.randomTrace.drawnCardIds).toHaveLength(1);
    expect(reading.randomTrace.orientations).toHaveLength(1);
    expect(reading.randomTrace.method).toBeTruthy();
  });
});
