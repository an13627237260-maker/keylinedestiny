import { describe, expect, it } from "vitest";
import { computeBazi } from "@/lib/fortune/bazi";
import { runBaziRules } from "@/lib/fortune/rules/baziRules";
import { runRuleEngine } from "@/lib/fortune/rules/ruleEngine";
import type { Rule } from "@/lib/fortune/rules/types";

const INPUT = {
  gender: "male" as const,
  birthDate: "1990-05-15",
  birthTime: "10:30",
  timezone: "Asia/Shanghai",
  useTrueSolarTime: false,
  focusArea: "overall" as const,
  targetYear: 2026,
};

describe("evidence driven rule engine", () => {
  it("每个 ruleResult 必须有 evidence", () => {
    const { algorithm_result } = computeBazi(INPUT);
    const rules = runBaziRules(algorithm_result, "overall");
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      expect(rule.evidence.length).toBeGreaterThan(0);
      expect(rule.evidence[0].id).toBeTruthy();
      expect(rule.evidence[0].source).toBeTruthy();
      expect(rule.confidence).toBeGreaterThan(0);
    }
  });

  it("没有 evidence 不生成判断", () => {
    const { algorithm_result } = computeBazi(INPUT);
    const emptyEvidenceRule: Rule = {
      id: "empty",
      category: "advice",
      priority: 99,
      condition: (ctx) => !!ctx.algo.pillarStrings.day,
      score: 80,
      tags: ["空证据"],
      message: "这条规则不应输出",
      evidence: () => [],
    };
    const results = runRuleEngine([emptyEvidenceRule], {
      algo: algorithm_result,
      focusArea: "overall",
    });
    expect(results).toHaveLength(0);
  });

  it("相似规则去重时合并 evidence", () => {
    const { algorithm_result } = computeBazi(INPUT);
    const rules: Rule[] = [
      {
        id: "a",
        category: "personality",
        priority: 70,
        condition: (ctx) => !!ctx.algo.pillarStrings.day,
        score: 70,
        tags: ["甲"],
        message: "相似规则用于测试合并 evidence",
        evidence: () => ["证据A"],
      },
      {
        id: "b",
        category: "personality",
        priority: 70,
        condition: (ctx) => !!ctx.algo.pillarStrings.month,
        score: 72,
        tags: ["乙"],
        message: "相似规则用于测试合并 evidence",
        evidence: () => ["证据B"],
      },
    ];
    const results = runRuleEngine(rules, { algo: algorithm_result, focusArea: "overall" });
    expect(results).toHaveLength(1);
    expect(results[0].evidence.map((item) => item.detail).join("")).toContain("证据A");
    expect(results[0].evidence.map((item) => item.detail).join("")).toContain("证据B");
  });
});
