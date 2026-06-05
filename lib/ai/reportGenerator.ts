import { callOpenAI } from "./openaiClient";
import {
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
  sanitizeForAi,
  validateAiReport,
} from "./consistencyChecker";
import type { AiReport } from "./schemas";

async function generateReport(
  algorithmResult: unknown,
  buildPrompt: () => string,
  fallback: () => AiReport,
): Promise<{ report: AiReport; text: string; usedFallback: boolean }> {
  const sanitized = sanitizeForAi(
    typeof algorithmResult === "object" && algorithmResult
      ? (algorithmResult as Record<string, unknown>)
      : { data: algorithmResult },
  );

  const raw = await callOpenAI(SYSTEM_PROMPT, buildPrompt());
  if (!raw) {
    const fb = fallback();
    return { report: fb, text: formatAiReportAsText(fb), usedFallback: true };
  }

  const validated = validateAiReport(raw, sanitized);
  if (!validated.ok) {
    const fb = fallback();
    return { report: fb, text: formatAiReportAsText(fb), usedFallback: true };
  }

  return {
    report: validated.report,
    text: formatAiReportAsText(validated.report),
    usedFallback: false,
  };
}

export async function generateBaziReport(
  algorithmResult: unknown,
  focusArea: string,
  warnings: string[] = [],
) {
  return generateReport(
    algorithmResult,
    () => buildBaziUserPrompt(algorithmResult, focusArea, warnings),
    () =>
      buildFallbackBaziReport(
        algorithmResult as Record<string, unknown>,
        focusArea,
      ),
  );
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
