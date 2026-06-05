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

  it("不依赖 Node crypto，也不使用 Math.random", () => {
    const source = readFileSync("lib/fortune/zodiac/fortune.ts", "utf8");
    expect(source).not.toContain("from \"crypto\"");
    expect(source).not.toContain("from 'crypto'");
    expect(source).not.toContain("Math.random");
  });
});
