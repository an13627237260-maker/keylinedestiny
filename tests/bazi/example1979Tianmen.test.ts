import { describe, expect, it } from "vitest";
import { computeBazi } from "@/lib/fortune/bazi";
import { generateBaziReport } from "@/lib/fortune/report/baziReport";
import { runBaziRules } from "@/lib/fortune/rules/baziRules";

const INPUT = {
  gender: "female" as const,
  birthDate: "1979-12-31",
  birthTime: "06:00",
  province: "湖北省",
  city: "天门市",
  longitude: 113.1661,
  latitude: 30.6634,
  timezone: "Asia/Shanghai",
  useTrueSolarTime: true,
  targetYear: 2026,
  focusArea: "overall" as const,
};

const FORBIDDEN = [
  "一定",
  "必然",
  "注定",
  "百分百",
  "必发财",
  "必脱单",
  "必复合",
  "必离婚",
  "必生病",
  "包赚钱",
  "包上岸",
  "改命",
  "逆天改运",
];

describe("1979-12-31 06:00 女 湖北天门", () => {
  const result = computeBazi(INPUT);
  const algo = result.algorithm_result;

  it("真太阳时修正约 -27.34 分钟，修正后仍属卯时", () => {
    expect(algo.locationInfluence?.correctionMinutes).toBeCloseTo(-27.34, 1);
    expect(algo.effectiveDateTime).toContain("05:32");
    expect(algo.pillars.hour.branch).toBe("卯");
  });

  it("四柱为己未 丙子 庚午 己卯", () => {
    expect(algo.pillarStrings.year).toBe("己未");
    expect(algo.pillarStrings.month).toBe("丙子");
    expect(algo.pillarStrings.day).toBe("庚午");
    expect(algo.pillarStrings.hour).toBe("己卯");
    expect(algo.dayMasterStrength.dayMaster).toBe("庚");
    expect(algo.pillars.month.branch).toBe("子");
  });

  it("调候识别寒湿、水旺寒重和火调候", () => {
    const climateText = [
      algo.climate.climateType,
      ...algo.climate.reasoning,
      ...algo.climate.usefulClimateHints,
    ].join("");
    expect(climateText).toMatch(/寒湿|水旺寒重/);
    expect(climateText).toContain("火为重要调候倾向");
  });

  it("命局识别子午冲并判断夫妻宫被冲", () => {
    expect(
      algo.branchRelations.clashes.some((r) => r.branches.includes("子") && r.branches.includes("午")),
    ).toBe(true);
    expect(algo.spousePalace.spousePalace).toBe("午");
    expect(algo.spousePalace.isClashed).toBe(true);
    expect(algo.spousePalace.evidence.some((e) => e.detail.includes("夫妻宫"))).toBe(true);
  });

  it("2026 流年为丙午，丙为庚金七杀，并引动午午自刑和子午冲", () => {
    expect(algo.yearlyLuck?.yearPillar).toBe("丙午");
    expect(algo.yearlyLuck?.yearStemTenGod).toBe("七杀");
    expect(
      algo.yearlyLuck?.branchRelationsWithNatal.punishments.some((r) => r.description === "午午自刑"),
    ).toBe(true);
    expect(
      algo.yearlyLuck?.branchRelationsWithNatal.clashes.some((r) =>
        r.branches.includes("子") && r.branches.includes("午"),
      ),
    ).toBe(true);
  });

  it("女命火为官杀，识别为关系、规则与压力主题", () => {
    expect(algo.spousePalace.spouseStar.stars).toEqual(["正官", "七杀"]);
    expect(algo.spousePalace.spouseStar.appearedInStems).toBe(true);
    expect(algo.yearlyLuck?.yearStemTenGod).toBe("七杀");
  });

  it("报告无绝对预测词且包含免责声明", () => {
    const rules = runBaziRules(algo, INPUT.focusArea);
    const report = generateBaziReport(algo, rules, INPUT);
    const text = [
      report.summary,
      ...report.sections.map((section) => section.content),
      ...report.advice,
      report.disclaimer,
    ].join("");
    for (const word of FORBIDDEN) {
      expect(text).not.toContain(word);
    }
    expect(text).toContain("不构成现实决策依据");
    expect(text).toContain("不构成医学诊断");
  });
});
