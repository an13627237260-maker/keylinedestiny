import { describe, expect, it } from "vitest";
import { analyzeBranchRelations } from "@/lib/fortune/bazi/branchRelations";
import { getSexagenary } from "@/lib/fortune/bazi/ganzhi";
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
