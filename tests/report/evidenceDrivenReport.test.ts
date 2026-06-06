import { describe, expect, it } from "vitest";
import { computeBazi } from "@/lib/fortune/bazi";
import { generateBaziReport } from "@/lib/fortune/report/baziReport";
import { runBaziRules } from "@/lib/fortune/rules/baziRules";

const INPUT = {
  gender: "female" as const,
  birthDate: "1988-08-08",
  birthTime: "08:00",
  timezone: "Asia/Shanghai",
  useTrueSolarTime: false,
  focusArea: "career" as const,
  targetYear: 2026,
};

describe("evidence driven bazi report", () => {
  it("每个 ruleResult 必须带 evidence", () => {
    const { algorithm_result } = computeBazi(INPUT);
    const rules = runBaziRules(algorithm_result, INPUT.focusArea);
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      expect(rule.evidence.length).toBeGreaterThan(0);
      for (const evidence of rule.evidence) {
        expect(evidence.source).toBeTruthy();
        expect(evidence.category).toBeTruthy();
        expect(evidence.weight).toBeGreaterThan(0);
        expect(evidence.title).toBeTruthy();
        expect(evidence.detail).toBeTruthy();
      }
    }
  });

  it("每个 report section 必须有依据", () => {
    const { algorithm_result } = computeBazi(INPUT);
    const rules = runBaziRules(algorithm_result, INPUT.focusArea);
    const report = generateBaziReport(algorithm_result, rules, INPUT);
    expect(report.sections.map((section) => section.title)).toEqual([
      "命盘总览",
      "四柱结构",
      "日主强弱",
      "五行分布",
      "十神结构",
      "调候分析",
      "合冲刑害",
      "夫妻宫与感情关系",
      "事业方向",
      "财运模式",
      "家庭责任",
      "健康倾向",
      "当前大运",
      "目标流年",
      "流月 / 流日提示",
      "风险点",
      "行动建议",
      "依据摘要",
      "免责声明",
    ]);
    for (const section of report.sections) {
      expect(section.content).toContain("结论：");
      expect(section.content).toContain("依据：");
      expect(section.content).toContain("影响：");
      expect(section.content).toContain("建议：");
      expect(section.evidence?.length).toBeGreaterThan(0);
      expect(section.evidenceIds?.length).toBeGreaterThan(0);
      expect(section.basis?.length).toBeGreaterThan(0);
      expect(section.advice).toBeTruthy();
    }
  });

  it("建议必须有 evidence 来源", () => {
    const { algorithm_result } = computeBazi(INPUT);
    const rules = runBaziRules(algorithm_result, INPUT.focusArea);
    const report = generateBaziReport(algorithm_result, rules, INPUT);
    expect(report.advice.length).toBeGreaterThan(0);
    for (const advice of report.advice) {
      expect(advice).toContain("依据：");
    }
  });

  it("没有 rule evidence 时不生成无依据规则判断", () => {
    const { algorithm_result } = computeBazi(INPUT);
    const report = generateBaziReport(algorithm_result, [], INPUT);
    const adviceSection = report.sections.find((section) => section.title === "行动建议");
    expect(adviceSection?.evidence?.length).toBeGreaterThan(0);
    expect(adviceSection?.content).not.toContain("这条规则不应输出");
  });

  it("报告不出现绝对化禁用词", () => {
    const { algorithm_result } = computeBazi(INPUT);
    const rules = runBaziRules(algorithm_result, INPUT.focusArea);
    const report = generateBaziReport(algorithm_result, rules, INPUT);
    const text = [
      report.summary,
      ...report.sections.map((section) => section.content),
      ...report.advice,
    ].join("");
    for (const word of ["一定", "必然", "注定", "百分百", "必发财", "必脱单", "必复合", "改命", "逆天改运", "包上岸", "包赚钱"]) {
      expect(text).not.toContain(word);
    }
  });
});
