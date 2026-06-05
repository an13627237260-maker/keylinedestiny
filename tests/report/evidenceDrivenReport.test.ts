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
  it("每个 report section 必须有依据", () => {
    const { algorithm_result } = computeBazi(INPUT);
    const rules = runBaziRules(algorithm_result, INPUT.focusArea);
    const report = generateBaziReport(algorithm_result, rules, INPUT);
    expect(report.sections.length).toBeGreaterThanOrEqual(12);
    for (const section of report.sections) {
      expect(section.content).toContain("结论：");
      expect(section.content).toContain("依据：");
      expect(section.content).toContain("影响：");
      expect(section.content).toContain("建议：");
      expect(section.evidence?.length).toBeGreaterThan(0);
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
    const adviceSection = report.sections.find((section) => section.title === "具体建议");
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
