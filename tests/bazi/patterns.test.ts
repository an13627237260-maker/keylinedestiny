import { describe, expect, it } from "vitest";
import { analyzePatterns } from "@/lib/fortune/bazi/patterns";
import type { DayMasterStrengthAnalysis } from "@/lib/fortune/bazi/dayMasterStrength";
import type {
  EarthlyBranch,
  HeavenlyStem,
} from "@/lib/fortune/bazi/constants";
import type { FourPillars } from "@/lib/fortune/bazi/pillars";
import type { TenGod, TenGodsAnalysis } from "@/lib/fortune/bazi/tenGods";

const GODS: TenGod[] = [
  "比肩",
  "劫财",
  "食神",
  "伤官",
  "偏财",
  "正财",
  "七杀",
  "正官",
  "偏印",
  "正印",
];

function p(stem: HeavenlyStem, branch: EarthlyBranch, index: number) {
  return { stem, branch, index };
}

function basePillars(monthBranch: EarthlyBranch): FourPillars {
  return {
    year: p("甲", "子", 0),
    month: p("乙", monthBranch, 1),
    day: p("甲", "午", 2),
    hour: p("丁", "酉", 3),
  };
}

function counts(overrides: Partial<Record<TenGod, number>> = {}): Record<TenGod, number> {
  const out = {} as Record<TenGod, number>;
  for (const god of GODS) out[god] = overrides[god] ?? 0;
  return out;
}

function tenGods(input: {
  monthBranch: EarthlyBranch;
  monthMainGod: TenGod;
  counts?: Partial<Record<TenGod, number>>;
  exposed?: Partial<Record<"year" | "month" | "hour", TenGod>>;
}): TenGodsAnalysis {
  return {
    dayMaster: "甲",
    pillarStemGods: {
      year: input.exposed?.year ?? "比肩",
      month: input.exposed?.month ?? "劫财",
      day: "比肩",
      hour: input.exposed?.hour ?? "伤官",
    },
    hiddenStemGods: [
      {
        branch: input.monthBranch,
        stem: "乙",
        god: input.monthMainGod,
        weight: 0.6,
      },
    ],
    counts: counts(input.counts),
    dominantTendency: ["比肩"],
    evidence: ["测试十神证据"],
  };
}

function dayMaster(overrides: Partial<DayMasterStrengthAnalysis> = {}): DayMasterStrengthAnalysis {
  return {
    dayMaster: "甲",
    dayMasterElement: "木",
    strengthScore: 50,
    strengthLevel: "balanced",
    supportFactors: ["测试支持"],
    weakeningFactors: ["测试消耗"],
    reasoning: ["测试推导"],
    confidence: 60,
    ...overrides,
  };
}

describe("patterns 格局倾向", () => {
  it("没月令证据时不硬定格", () => {
    const result = analyzePatterns({
      pillars: basePillars("寅"),
      tenGods: tenGods({
        monthBranch: "寅",
        monthMainGod: "比肩",
      }),
      dayMasterStrength: dayMaster(),
      symbolicStars: [],
    });
    expect(result.tendencies[0].patternName).toContain("格局证据不足");
    expect(result.tendencies[0].cautions.join("")).toContain("倾向分析");
  });

  it("从格条件不足时不输出从财从杀从儿", () => {
    const result = analyzePatterns({
      pillars: basePillars("辰"),
      tenGods: tenGods({
        monthBranch: "辰",
        monthMainGod: "正财",
        counts: { 正财: 4.2, 偏财: 0.4, 七杀: 0.2 },
        exposed: { month: "正财" },
      }),
      dayMasterStrength: dayMaster({
        strengthScore: 42,
        strengthLevel: "weak",
        supportFactors: ["仍有印比支持"],
      }),
      symbolicStars: [],
    });
    const names = result.tendencies.map((item) => item.patternName).join("、");
    expect(names).not.toContain("从财");
    expect(names).not.toContain("从杀");
    expect(names).not.toContain("从儿");
  });

  it("格局信心不轻易超过 75 且输出倾向标签", () => {
    const result = analyzePatterns({
      pillars: basePillars("辰"),
      tenGods: tenGods({
        monthBranch: "辰",
        monthMainGod: "正财",
        counts: { 正财: 3.6, 偏财: 1.1 },
        exposed: { month: "正财" },
      }),
      dayMasterStrength: dayMaster({
        strengthScore: 36,
        strengthLevel: "weak",
      }),
      symbolicStars: [],
    });
    expect(result.tendencies.every((item) => item.confidence <= 75)).toBe(true);
    expect(result.tendencies.some((item) => item.patternName.includes("倾向"))).toBe(true);
    expect(result.step.notes.join("")).toContain("未作专业定格");
  });
});
