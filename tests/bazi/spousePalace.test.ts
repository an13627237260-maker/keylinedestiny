import { describe, expect, it } from "vitest";
import { analyzeBranchRelations } from "@/lib/fortune/bazi/branchRelations";
import { getAllHiddenStems } from "@/lib/fortune/bazi/hiddenStems";
import { analyzeSpousePalace } from "@/lib/fortune/bazi/spousePalace";
import { analyzeTenGods } from "@/lib/fortune/bazi/tenGods";
import type { EarthlyBranch, HeavenlyStem } from "@/lib/fortune/bazi/constants";
import type { FourPillars } from "@/lib/fortune/bazi/pillars";

function pillar(stem: HeavenlyStem, branch: EarthlyBranch, index = 0) {
  return { stem, branch, index };
}

function analyze(input: { gender: "male" | "female" | "unknown" }, pillars: FourPillars) {
  const hidden = getAllHiddenStems([
    pillars.year.branch,
    pillars.month.branch,
    pillars.day.branch,
    pillars.hour.branch,
  ]);
  const tenGods = analyzeTenGods(pillars, hidden).analysis;
  const branchRelations = analyzeBranchRelations(pillars).analysis;
  return analyzeSpousePalace({
    input: {
      gender: input.gender,
      birthDate: "1979-12-31",
      birthTime: "06:00",
      timezone: "Asia/Shanghai",
      useTrueSolarTime: false,
      focusArea: "relationship",
    },
    pillars,
    tenGods,
    branchRelations,
    annualLuck: {
      targetYear: 2026,
      yearPillar: "丙午",
      yearStemTenGod: "七杀",
      branchRelationsWithNatal: branchRelations,
      relationWithLuckCycle: [],
      fiveElementImpact: { 木: "", 火: "", 土: "", 金: "", 水: "" },
      focusAreaHints: {},
    },
  });
}

describe("spousePalace", () => {
  it("日支被冲识别夫妻宫被冲，流年引动日支", () => {
    const pillars: FourPillars = {
      year: pillar("己", "未"),
      month: pillar("丙", "子"),
      day: pillar("庚", "午"),
      hour: pillar("己", "卯"),
    };
    const result = analyze({ gender: "female" }, pillars);
    expect(result.spousePalace).toBe("午");
    expect(result.isClashed).toBe(true);
    expect(result.activatedByTargetYear).toBe(true);
    expect(result.evidence.some((e) => e.detail.includes("夫妻宫"))).toBe(true);
  });

  it("女命官杀识别为伴侣星", () => {
    const result = analyze({ gender: "female" }, {
      year: pillar("己", "未"),
      month: pillar("丙", "子"),
      day: pillar("庚", "午"),
      hour: pillar("己", "卯"),
    });
    expect(result.spouseStar.stars).toEqual(["正官", "七杀"]);
    expect(result.spouseStar.appearedInStems).toBe(true);
  });

  it("男命财星识别为伴侣星", () => {
    const result = analyze({ gender: "male" }, {
      year: pillar("甲", "子"),
      month: pillar("丙", "寅"),
      day: pillar("庚", "午"),
      hour: pillar("己", "卯"),
    });
    expect(result.spouseStar.stars).toEqual(["正财", "偏财"]);
    expect(result.spouseStar.appearedInStems).toBe(true);
  });
});
