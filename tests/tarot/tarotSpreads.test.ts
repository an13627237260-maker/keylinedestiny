import { describe, expect, it } from "vitest";
import { getTarotSpread, TAROT_SPREADS } from "@/lib/fortune/tarot";

describe("tarot spreads", () => {
  it("每个 spread count > 0 且等于 positions.length", () => {
    for (const spread of TAROT_SPREADS) {
      expect(spread.count).toBeGreaterThan(0);
      expect(spread.positions.length).toBeGreaterThan(0);
      expect(spread.count).toBe(spread.positions.length);
    }
  });

  it("unknown spread 返回 single", () => {
    expect(getTarotSpread("unknown").id).toBe("single");
  });

  it("支持所有目标牌阵", () => {
    expect(getTarotSpread("single").count).toBe(1);
    expect(getTarotSpread("three-card").count).toBe(3);
    expect(getTarotSpread("love").positions.map((p) => p.id)).toEqual(["self", "other", "advice"]);
    expect(getTarotSpread("career").positions.map((p) => p.id)).toEqual(["current", "challenge", "action"]);
    expect(getTarotSpread("study").positions.map((p) => p.id)).toEqual(["state", "obstacle", "method"]);
    expect(getTarotSpread("yes-no").count).toBe(1);
  });

  it("兼容旧 spread id", () => {
    expect(getTarotSpread("threeCard").id).toBe("three-card");
    expect(getTarotSpread("yesNo").id).toBe("yes-no");
  });
});
