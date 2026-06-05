import {
  callOpenAI,
  getOpenAIModel,
  hasOpenAIApiKey,
} from "./openaiClient";
import {
  BAZI_SYSTEM_PROMPT,
  SYSTEM_PROMPT,
  buildBaziUserPrompt,
  buildLoveUserPrompt,
  buildNameUserPrompt,
  buildTarotUserPrompt,
  buildZodiacUserPrompt,
} from "./prompts";
import {
  buildFallbackBaziReport,
  buildFallbackLoveReport,
  buildFallbackNameReport,
  buildFallbackTarotReport,
  buildFallbackZodiacReport,
  formatAiReportAsText,
  formatBaziFallbackText,
  sanitizeForAi,
  validateAiReport,
} from "./consistencyChecker";
import type { AiReport } from "./schemas";
import type { AiStatus } from "./types";
import { getAiStatusDisplayLabel } from "./types";

export interface BaziReportResult {
  report: AiReport;
  text: string;
  ai_status: AiStatus;
}

async function generateReport(
  algorithmResult: unknown,
  buildPrompt: () => string,
  fallback: () => AiReport,
  systemPrompt = SYSTEM_PROMPT,
  baziMode = false,
): Promise<{ report: AiReport; text: string; ai_status: AiStatus }> {
  const sanitized = sanitizeForAi(
    typeof algorithmResult === "object" && algorithmResult
      ? (algorithmResult as Record<string, unknown>)
      : { data: algorithmResult },
  );

  const call = await callOpenAI(systemPrompt, buildPrompt());

  if (!call.ok) {
    const fb = fallback();
    const text = baziMode
      ? formatBaziFallbackText(sanitized, "overall")
      : formatAiReportAsText(fb);
    const ai_status: AiStatus = {
      provider: "fallback",
      reason: call.reason,
      consistency_passed: false,
      display_label: "",
    };
    ai_status.display_label = getAiStatusDisplayLabel(ai_status);
    return { report: fb, text, ai_status };
  }

  const validated = validateAiReport(call.content, sanitized, { baziMode });
  if (!validated.ok) {
    const fb = fallback();
    const text = baziMode
      ? formatBaziFallbackText(sanitized, "overall")
      : formatAiReportAsText(fb);
    const ai_status: AiStatus = {
      provider: "fallback",
      reason: `OpenAI 输出未通过一致性检查：${validated.reason}`,
      model: getOpenAIModel(),
      consistency_passed: false,
      display_label: "",
    };
    ai_status.display_label = getAiStatusDisplayLabel(ai_status);
    return { report: fb, text, ai_status };
  }

  const ai_status: AiStatus = {
    provider: "openai",
    reason: "OpenAI 报告生成成功",
    model: getOpenAIModel(),
    consistency_passed: true,
    display_label: "",
  };
  ai_status.display_label = getAiStatusDisplayLabel(ai_status);

  return {
    report: validated.report,
    text: formatAiReportAsText(validated.report),
    ai_status,
  };
}

export async function generateBaziReport(
  algorithmResult: unknown,
  focusArea: string,
  warnings: string[] = [],
  calculationSteps: unknown[] = [],
): Promise<BaziReportResult> {
  const algo =
    typeof algorithmResult === "object" && algorithmResult
      ? (algorithmResult as Record<string, unknown>)
      : {};

  const call = await callOpenAI(
    BAZI_SYSTEM_PROMPT,
    buildBaziUserPrompt(algorithmResult, focusArea, warnings, calculationSteps),
  );

  if (!call.ok) {
    const fb = buildFallbackBaziReport(algo, focusArea);
    const text = formatBaziFallbackText(algo, focusArea);
    const ai_status: AiStatus = {
      provider: "fallback",
      reason: call.reason,
      consistency_passed: false,
      display_label: "",
    };
    ai_status.display_label = getAiStatusDisplayLabel(ai_status);
    return { report: fb, text, ai_status };
  }

  const validated = validateAiReport(call.content, algorithmResult, {
    baziMode: true,
  });

  if (!validated.ok) {
    const fb = buildFallbackBaziReport(algo, focusArea);
    const text = formatBaziFallbackText(algo, focusArea);
    const ai_status: AiStatus = {
      provider: "fallback",
      reason: `OpenAI 输出未通过一致性检查：${validated.reason}`,
      model: getOpenAIModel(),
      consistency_passed: false,
      display_label: "",
    };
    ai_status.display_label = getAiStatusDisplayLabel(ai_status);
    return { report: fb, text, ai_status };
  }

  const ai_status: AiStatus = {
    provider: "openai",
    reason: hasOpenAIApiKey()
      ? "OpenAI 报告生成成功"
      : "当前未配置 OpenAI API Key，因此使用本地命理模板生成报告。",
    model: getOpenAIModel(),
    consistency_passed: true,
    display_label: "",
  };
  ai_status.display_label = getAiStatusDisplayLabel(ai_status);

  return {
    report: validated.report,
    text: formatAiReportAsText(validated.report),
    ai_status,
  };
}

export async function generateTarotReport(
  algorithmResult: unknown,
  question?: string,
) {
  return generateReport(
    algorithmResult,
    () => buildTarotUserPrompt(algorithmResult, question),
    () => buildFallbackTarotReport(algorithmResult as Record<string, unknown>),
  );
}

export async function generateZodiacReport(algorithmResult: unknown) {
  return generateReport(
    algorithmResult,
    () => buildZodiacUserPrompt(algorithmResult),
    () => buildFallbackZodiacReport(algorithmResult as Record<string, unknown>),
  );
}

export async function generateNameReport(algorithmResult: unknown) {
  return generateReport(
    algorithmResult,
    () => buildNameUserPrompt(algorithmResult),
    () => buildFallbackNameReport(algorithmResult as Record<string, unknown>),
  );
}

export async function generateLoveReport(algorithmResult: unknown) {
  return generateReport(
    algorithmResult,
    () => buildLoveUserPrompt(algorithmResult),
    () => buildFallbackLoveReport(algorithmResult as Record<string, unknown>),
  );
}
