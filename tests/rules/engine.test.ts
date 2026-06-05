import { describe, it, expect } from "vitest";
import { runRuleEngine } from "@/lib/fortune/rules/ruleEngine";
import { ALL_BAZI_RULES } from "@/lib/fortune/rules/baziRules";
import { computeBazi } from "@/lib/fortune/bazi";

describe("规则引擎", () => {
  it("执行并分组输出", () => {
    const { algorithm_result } = computeBazi({
      gender: "female",
      birthDate: "1988-08-08",
      birthTime: "08:00",
      timezone: "Asia/Shanghai",
      useTrueSolarTime: false,
      focusArea: "career",
    });
    const results = runRuleEngine(ALL_BAZI_RULES, {
      algo: algorithm_result,
      focusArea: "career",
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].ruleId).toBeTruthy();
    expect(results[0].message.length).toBeGreaterThan(4);
  });
});
