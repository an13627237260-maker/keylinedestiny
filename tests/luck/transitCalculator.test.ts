import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import { computeBazi } from "@/lib/fortune/bazi";
import {
  calculateTransitContext,
  getDayPillarForDateTime,
} from "@/lib/fortune/luck/transitCalculator";
import { getDayPillarIndex, getSexagenary } from "@/lib/fortune/bazi/ganzhi";

const INPUT = {
  gender: "male" as const,
  birthDate: "1990-05-15",
  birthTime: "10:30",
  timezone: "Asia/Shanghai",
  useTrueSolarTime: false,
  focusArea: "overall" as const,
};

describe("transitCalculator", () => {
  const bazi = computeBazi(INPUT).algorithm_result;

  it("不同日期流日干支不同", () => {
    const a = calculateTransitContext(bazi, new Date("2026-01-01"));
    const b = calculateTransitContext(bazi, new Date("2026-08-20"));
    expect(a.day.pillar).not.toBe(b.day.pillar);
  });

  it("包含流年流月流日十神", () => {
    const ctx = calculateTransitContext(bazi, new Date("2026-06-05"));
    expect(ctx.year.stemTenGod).toBeTruthy();
    expect(ctx.month.stemTenGod).toBeTruthy();
    expect(ctx.day.stemTenGod).toBeTruthy();
  });

  it("evidence 不为空", () => {
    const ctx = calculateTransitContext(bazi, new Date("2026-06-05"));
    expect(ctx.evidence.length).toBeGreaterThan(0);
  });

  it("categorySignals 含全部分项", () => {
    const ctx = calculateTransitContext(bazi, new Date("2026-06-05"));
    expect(ctx.categorySignals.relationship).toBeDefined();
    expect(ctx.categorySignals.love).toBeDefined();
    expect(ctx.categorySignals.wealth).toBeDefined();
    expect(ctx.categorySignals.career).toBeDefined();
    expect(ctx.categorySignals.study).toBeDefined();
    expect(ctx.categorySignals.social).toBeDefined();
    expect(ctx.categorySignals.health).toBeDefined();
    expect(ctx.categorySignals.family).toBeDefined();
  });

  it("同一日期重复计算一致", () => {
    const d = new Date("2026-06-05");
    const a = calculateTransitContext(bazi, d);
    const b = calculateTransitContext(bazi, d);
    expect(a.day.pillar).toBe(b.day.pillar);
    expect(a.categorySignals).toEqual(b.categorySignals);
  });

  it("同一 Asia/Shanghai 日期在不同时区表达下流日一致", () => {
    const a = calculateTransitContext(bazi, new Date("2026-06-05T00:30:00+08:00"));
    const b = calculateTransitContext(bazi, new Date("2026-06-04T16:30:00Z"));
    expect(a.day.pillar).toBe(b.day.pillar);
    expect(a.day.date).toBe("2026-06-05");
  });

  it("今天和明天流日不同", () => {
    const today = calculateTransitContext(bazi, new Date("2026-06-05T12:00:00+08:00"));
    const tomorrow = calculateTransitContext(bazi, new Date("2026-06-06T12:00:00+08:00"));
    expect(today.day.pillar).not.toBe(tomorrow.day.pillar);
  });

  it("流日使用真实日柱算法，不用日期 hash 替代", () => {
    const dt = DateTime.fromISO("2026-06-05T12:00:00", { zone: "Asia/Shanghai" });
    const pillar = getDayPillarForDateTime(dt);
    const expected = getSexagenary(getDayPillarIndex(2026, 6, 5));
    expect(pillar.stem + pillar.branch).toBe(expected.stem + expected.branch);
  });

  it("transitCalculator 不直接使用 JS Date 本地年月日取值", () => {
    const source = readFileSync("lib/fortune/luck/transitCalculator.ts", "utf8");
    expect(source).not.toMatch(/getFullYear|getMonth\(|getDate\(/);
    expect(source).not.toContain("Math.random");
  });
});
