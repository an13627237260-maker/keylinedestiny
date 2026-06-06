import { describe, expect, it } from "vitest";
import { computeBazi } from "@/lib/fortune/bazi";
import { analyzeBranchRelations } from "@/lib/fortune/bazi/branchRelations";
import { getSexagenary } from "@/lib/fortune/bazi/ganzhi";
import { generateBaziReport } from "@/lib/fortune/report/baziReport";
import { runBaziRules } from "@/lib/fortune/rules/baziRules";
import type { EarthlyBranch } from "@/lib/fortune/bazi/constants";
import type { FourPillars } from "@/lib/fortune/bazi/pillars";

function pillars(branches: [EarthlyBranch, EarthlyBranch, EarthlyBranch, EarthlyBranch]): FourPillars {
  return {
    year: { ...getSexagenary(0), branch: branches[0] },
    month: { ...getSexagenary(1), branch: branches[1] },
    day: { ...getSexagenary(2), branch: branches[2] },
    hour: { ...getSexagenary(3), branch: branches[3] },
  };
}

describe("branchRelations punishments", () => {
  it("只有一个辰，不触发自刑", () => {
    const { analysis } = analyzeBranchRelations(pillars(["辰", "子", "丑", "寅"]));
    expect(analysis.punishments.some((p) => p.description.includes("辰辰自刑"))).toBe(false);
  });

  it("两个辰，触发辰辰自刑", () => {
    const { analysis } = analyzeBranchRelations(pillars(["辰", "辰", "子", "丑"]));
    expect(analysis.punishments.some((p) => p.type === "自刑" && p.description === "辰辰自刑")).toBe(true);
  });

  it("只有一个午，不触发自刑", () => {
    const { analysis } = analyzeBranchRelations(pillars(["午", "子", "丑", "寅"]));
    expect(analysis.punishments.some((p) => p.description.includes("午午自刑"))).toBe(false);
  });

  it("两个午，触发午午自刑", () => {
    const { analysis } = analyzeBranchRelations(pillars(["午", "午", "子", "丑"]));
    expect(analysis.punishments.some((p) => p.type === "自刑" && p.description === "午午自刑")).toBe(true);
  });

  it("寅巳申全有，触发三刑成立", () => {
    const { analysis } = analyzeBranchRelations(pillars(["寅", "巳", "申", "子"]));
    expect(analysis.punishments.some((p) => p.description === "寅巳申三刑成立")).toBe(true);
  });

  it("只有寅巳，触发刑势倾向，不写三刑成立", () => {
    const { analysis } = analyzeBranchRelations(pillars(["寅", "巳", "子", "丑"]));
    expect(analysis.punishments.some((p) => p.type === "刑势倾向" && p.description.includes("寅巳刑势倾向"))).toBe(true);
    expect(analysis.punishments.some((p) => p.description.includes("三刑成立"))).toBe(false);
  });

  it("丑未戌全有，触发三刑成立", () => {
    const { analysis } = analyzeBranchRelations(pillars(["丑", "未", "戌", "子"]));
    expect(analysis.punishments.some((p) => p.description === "丑未戌三刑成立")).toBe(true);
  });

  it("子卯同时出现，触发子卯刑", () => {
    const { analysis } = analyzeBranchRelations(pillars(["子", "卯", "丑", "寅"]));
    expect(analysis.punishments.some((p) => p.description === "子卯刑")).toBe(true);
  });
});

describe("branchRelations 三合与三会", () => {
  it("申子辰全出现，输出三合水局成局倾向且 confidence=90", () => {
    const { analysis } = analyzeBranchRelations(pillars(["申", "子", "辰", "丑"]));
    const relation = analysis.meetings.find((m) => m.description === "申子辰三合水局成局倾向");
    expect(relation?.confidence).toBe(90);
    expect(relation?.affectedArea.length).toBeGreaterThan(0);
  });

  it("申子只输出半合倾向，不写成局", () => {
    const { analysis } = analyzeBranchRelations(pillars(["申", "子", "丑", "寅"]));
    const relation = analysis.meetings.find((m) => m.description.includes("申子半合水势倾向"));
    expect(relation?.confidence).toBe(55);
    expect(analysis.meetings.some((m) => m.description.includes("三合水局成局"))).toBe(false);
  });

  it("申辰只输出拱合倾向", () => {
    const { analysis } = analyzeBranchRelations(pillars(["申", "辰", "丑", "寅"]));
    expect(analysis.meetings.some((m) => m.description.includes("申辰拱合水势倾向"))).toBe(true);
  });

  it("寅卯辰全出现，输出三会木势成势且 confidence=90", () => {
    const { analysis } = analyzeBranchRelations(pillars(["寅", "卯", "辰", "丑"]));
    const relation = analysis.meetings.find((m) => m.description === "寅卯辰三会木势成势");
    expect(relation?.confidence).toBe(90);
    expect(relation?.affectedArea.length).toBeGreaterThan(0);
  });

  it("寅卯只输出半会倾向，不写三会成立", () => {
    const { analysis } = analyzeBranchRelations(pillars(["寅", "卯", "子", "丑"]));
    const relation = analysis.meetings.find((m) => m.description.includes("寅卯半会木势倾向"));
    expect(relation?.confidence).toBe(55);
    expect(analysis.meetings.some((m) => m.description.includes("三会木势成势"))).toBe(false);
  });
});

describe("branchRelations 地支破", () => {
  it("子酉同时出现，触发子酉破", () => {
    const { analysis } = analyzeBranchRelations(pillars(["子", "酉", "丑", "寅"]));
    expect(analysis.breaks.some((b) => b.type === "破" && b.description.includes("子酉破"))).toBe(true);
  });

  it("午卯同时出现，触发午卯破", () => {
    const { analysis } = analyzeBranchRelations(pillars(["午", "卯", "丑", "寅"]));
    expect(analysis.breaks.some((b) => b.description.includes("午卯破"))).toBe(true);
  });

  it("辰丑同时出现，触发辰丑破", () => {
    const { analysis } = analyzeBranchRelations(pillars(["辰", "丑", "子", "寅"]));
    expect(analysis.breaks.some((b) => b.description.includes("辰丑破"))).toBe(true);
  });

  it("单独一个子不触发破", () => {
    const { analysis } = analyzeBranchRelations(pillars(["子", "丑", "寅", "卯"]));
    expect(analysis.breaks.some((b) => b.branches.includes("子"))).toBe(false);
  });

  it("破进入 rule evidence 和 report evidence", () => {
    const input = {
      gender: "male" as const,
      birthDate: "1984-02-02",
      birthTime: "18:00",
      timezone: "Asia/Shanghai",
      useTrueSolarTime: false,
      focusArea: "overall" as const,
      targetYear: 2026,
    };
    const { algorithm_result } = computeBazi(input);
    expect(algorithm_result.branchRelations.breaks.some((b) => b.description.includes("子酉破"))).toBe(true);
    const rules = runBaziRules(algorithm_result, input.focusArea);
    expect(rules.some((rule) => rule.evidence.some((e) => e.detail.includes("子酉破")))).toBe(true);
    const report = generateBaziReport(algorithm_result, rules, input);
    expect(
      report.sections.some((section) => section.evidence?.some((e) => e.detail.includes("子酉破"))),
    ).toBe(true);
  });
});
