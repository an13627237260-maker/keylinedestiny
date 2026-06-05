import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";
import { generateZodiacFortune, getZodiacById } from "@/lib/fortune/zodiac";

describe("zodiac fortune", () => {
  it("同一天同星座保持稳定", () => {
    const sign = getZodiacById("aries")!;
    const a = generateZodiacFortune(sign, "daily", "2026-06-05");
    const b = generateZodiacFortune(sign, "daily", "2026-06-05");
    expect(a.seed).toBe(b.seed);
    expect(a.themes).toEqual(b.themes);
    expect(a.summary).toBe(b.summary);
  });

  it("不同日期结果有变化", () => {
    const sign = getZodiacById("aries")!;
    const a = generateZodiacFortune(sign, "daily", "2026-06-05");
    const b = generateZodiacFortune(sign, "daily", "2026-06-06");
    expect(a.seed).not.toBe(b.seed);
    expect(a.scores).not.toEqual(b.scores);
  });

  it("支持日周月年与六项分数、幸运信息", () => {
    const sign = getZodiacById("taurus")!;
    for (const period of ["daily", "weekly", "monthly", "yearly"] as const) {
      const fortune = generateZodiacFortune(sign, period, "2026-06-05");
      expect(fortune.overallScore).toBeGreaterThanOrEqual(58);
      expect(fortune.overallScore).toBeLessThanOrEqual(93);
      expect(Object.keys(fortune.scores).sort()).toEqual([
        "career",
        "love",
        "social",
        "study",
        "wealth",
        "wellness",
      ]);
      expect(fortune.luckyColor).toBeTruthy();
      expect(fortune.luckyNumber).toBeGreaterThanOrEqual(1);
      expect(fortune.luckyNumber).toBeLessThanOrEqual(9);
      expect(fortune.luckyDirection).toBeTruthy();
    }
  });

  it("六项解释每项超过 100 字", () => {
    const sign = getZodiacById("gemini")!;
    const fortune = generateZodiacFortune(sign, "monthly", "2026-06-05");
    for (const text of Object.values(fortune.interpretations)) {
      expect(text.length).toBeGreaterThan(100);
    }
  });

  it("不依赖 Node crypto，也不使用 Math.random", () => {
    const source = readFileSync("lib/fortune/zodiac/fortune.ts", "utf8");
    expect(source).not.toContain("from \"crypto\"");
    expect(source).not.toContain("from 'crypto'");
    expect(source).not.toContain("node:crypto");
    expect(source).not.toContain("createHash");
    expect(source).not.toContain("Math.random");
  });
});
