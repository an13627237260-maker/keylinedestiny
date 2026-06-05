import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import { computeBazi } from "@/lib/fortune/bazi";
import {
  buildFallbackBaziReport,
  formatBaziFallbackText,
  validateBaziAiConsistency,
} from "@/lib/ai/consistencyChecker";
import { labelFocusArea, labelStrength } from "@/lib/fortune/shared/labels";
import { hasOpenAIApiKey } from "@/lib/ai/openaiClient";
import { generateBaziReport } from "@/lib/ai/reportGenerator";

function sampleAlgo() {
  const { algorithm_result } = computeBazi({
    gender: "male",
    birthDate: "1990-05-15",
    birthTime: "14:30",
    timezone: "Asia/Shanghai",
    useTrueSolarTime: false,
    focusArea: "study",
    targetYear: 2026,
    options: { dayBoundaryMode: "midnight" },
  });
  return algorithm_result;
}

function countHan(text: string): number {
  return (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
}

describe("中文标签", () => {
  it("balanced 显示为中和", () => {
    expect(labelStrength("balanced")).toBe("中和");
    expect(labelStrength("strong")).toBe("偏强");
    expect(labelStrength("weak")).toBe("偏弱");
  });

  it("study 显示为学业", () => {
    expect(labelFocusArea("study")).toBe("学业");
    expect(labelFocusArea("career")).toBe("事业");
  });
});

describe("本地 fallback 八字报告", () => {
  const algo = sampleAlgo();

  it("不少于 800 中文字", () => {
    const text = formatBaziFallbackText(
      algo as unknown as Record<string, unknown>,
      "study",
    );
    expect(countHan(text)).toBeGreaterThanOrEqual(800);
  });

  it("必须包含核心命盘信息", () => {
    const report = buildFallbackBaziReport(
      algo as unknown as Record<string, unknown>,
      "study",
    );
    const text = formatBaziFallbackText(
      algo as unknown as Record<string, unknown>,
      "study",
    );

    expect(text).toContain(algo.pillarStrings.year);
    expect(text).toContain(algo.dayMasterStrength.dayMaster);
    expect(text).toContain(algo.fiveElements.strongestElement);
    expect(text).toContain(algo.fiveElements.weakestElement);
    expect(text).toContain("学业");
    expect(report.advice.length).toBeGreaterThanOrEqual(5);
  });

  it("不含空泛占位句", () => {
    const text = formatBaziFallbackText(
      algo as unknown as Record<string, unknown>,
      "study",
    );
    expect(text).not.toContain("性格倾向需结合十神与五行平衡综合理解");
    expect(text).not.toContain("此处为简化概述");
    expect(text).not.toContain("将命理结果当作自我觉察的参考角度");
  });
});

describe("AI 一致性检查", () => {
  it("措辞不同不判失败", () => {
    const algo = sampleAlgo();
    const report = JSON.stringify({
      summary: `四柱${algo.pillarStrings.year}等，日主${algo.dayMasterStrength.dayMaster}，最旺五行${algo.fiveElements.strongestElement}`,
      key_points: ["解读基于算法"],
      advice: ["建议1", "建议2", "建议3", "建议4", "建议5"],
      warnings: [],
      disclaimer: "娱乐",
    });
    const result = validateBaziAiConsistency(report, algo);
    expect(result.ok).toBe(true);
  });

  it("改写日主判失败", () => {
    const algo = sampleAlgo();
    const wrongStem = algo.dayMasterStrength.dayMaster === "甲" ? "乙" : "甲";
    const report = `日主为${wrongStem}，最旺五行${algo.fiveElements.strongestElement}`;
    const result = validateBaziAiConsistency(report, algo);
    expect(result.ok).toBe(false);
  });
});

describe("ai_status", () => {
  it("没有 OPENAI_API_KEY 时返回明确 reason", async () => {
    const orig = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const algo = sampleAlgo();
    const result = await generateBaziReport(algo, "study", [], []);

    expect(result.ai_status.provider).toBe("fallback");
    expect(result.ai_status.reason).toContain("未配置 OpenAI API Key");
    expect(result.ai_status.consistency_passed).toBe(false);

    process.env.OPENAI_API_KEY = orig;
  });

  it("hasOpenAIApiKey 与 env 一致", () => {
    if (process.env.OPENAI_API_KEY) {
      expect(hasOpenAIApiKey()).toBe(true);
    } else {
      expect(hasOpenAIApiKey()).toBe(false);
    }
  });
});
