import { AI_FORBIDDEN_WORDS, DISCLAIMER } from "@/lib/fortune/shared/constants";
import type { AiReport } from "./schemas";
import { aiReportSchema } from "./schemas";
import {
  buildFallbackBaziReport,
  formatBaziFallbackText,
  formatAiReportAsText,
} from "./baziFallback";

export { formatAiReportAsText, buildFallbackBaziReport, formatBaziFallbackText };

export function sanitizeForAi(input: Record<string, unknown>): Record<string, unknown> {
  const copy = JSON.parse(JSON.stringify(input)) as Record<string, unknown>;
  delete copy.longitude;
  delete copy.latitude;
  delete copy.birthPlace;
  delete copy.name;
  return copy;
}

export function containsForbiddenWords(text: string): string[] {
  return AI_FORBIDDEN_WORDS.filter((w) => text.includes(w));
}

interface BaziFacts {
  pillars: string[];
  dayMaster: string;
  strongestElement: string;
  weakestElement: string;
}

function extractBaziFacts(algorithmResult: unknown): BaziFacts | null {
  if (!algorithmResult || typeof algorithmResult !== "object") return null;
  const ar = algorithmResult as Record<string, unknown>;
  const pillarStrings = ar.pillarStrings as Record<string, string> | undefined;
  const five = ar.fiveElements as
    | { strongestElement?: string; weakestElement?: string }
    | undefined;
  const dm = ar.dayMasterStrength as { dayMaster?: string } | undefined;
  if (!pillarStrings || !five || !dm?.dayMaster) return null;
  return {
    pillars: Object.values(pillarStrings),
    dayMaster: dm.dayMaster,
    strongestElement: five.strongestElement ?? "",
    weakestElement: five.weakestElement ?? "",
  };
}

/** 仅检查 AI 是否明确改写核心硬数据 */
export function validateBaziAiConsistency(
  reportText: string,
  algorithmResult: unknown,
): { ok: true } | { ok: false; reason: string } {
  const facts = extractBaziFacts(algorithmResult);
  if (!facts) return { ok: true };

  const contradictions: string[] = [];

  for (const pillar of facts.pillars) {
    const wrongPattern = new RegExp(
      `(年柱|月柱|日柱|时柱)[为是：:]\\s*[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]`,
      "g",
    );
    const matches = [...reportText.matchAll(wrongPattern)];
    for (const m of matches) {
      const stated = m[0].replace(/.*[为是：:]\s*/, "");
      if (stated && stated !== pillar && facts.pillars.every((p) => p !== stated)) {
        contradictions.push(`四柱表述可能与算法结果不一致：${m[0]}`);
      }
    }
  }

  const dayMasterWrong = new RegExp(
    `日主[为是：:]\\s*([甲乙丙丁戊己庚辛壬癸])`,
  );
  const dmMatch = reportText.match(dayMasterWrong);
  if (dmMatch && dmMatch[1] !== facts.dayMaster) {
    contradictions.push(
      `日主被改写：算法为${facts.dayMaster}，报告写为${dmMatch[1]}`,
    );
  }

  const strongWrong = reportText.match(/最旺五行[为是：:]\s*([木火土金水])/);
  if (strongWrong && strongWrong[1] !== facts.strongestElement) {
    contradictions.push(
      `最旺五行被改写：算法为${facts.strongestElement}，报告写为${strongWrong[1]}`,
    );
  }

  const weakWrong = reportText.match(/最弱五行[为是：:]\s*([木火土金水])/);
  if (weakWrong && weakWrong[1] !== facts.weakestElement) {
    contradictions.push(
      `最弱五行被改写：算法为${facts.weakestElement}，报告写为${weakWrong[1]}`,
    );
  }

  if (contradictions.length > 0) {
    return {
      ok: false,
      reason: contradictions.join("；"),
    };
  }
  return { ok: true };
}

export function validateAiReport(
  raw: string,
  algorithmResult: unknown,
  options?: { baziMode?: boolean },
): { ok: true; report: AiReport } | { ok: false; reason: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "AI 输出非合法 JSON" };
  }

  const result = aiReportSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues.map((i) => i.message).join("；");
    return { ok: false, reason: `AI 输出不符合 schema：${issues}` };
  }

  const fullText = JSON.stringify(result.data);
  const forbidden = containsForbiddenWords(fullText);
  if (forbidden.length > 0) {
    return { ok: false, reason: `含禁止词：${forbidden.join("、")}` };
  }

  if (options?.baziMode) {
    const consistency = validateBaziAiConsistency(fullText, algorithmResult);
    if (!consistency.ok) {
      return { ok: false, reason: consistency.reason };
    }
  }

  return { ok: true, report: result.data };
}

export function buildFallbackTarotReport(result: Record<string, unknown>): AiReport {
  const cards = result.cards as Array<{ card: { nameCn: string }; upright: boolean; position: string }> | undefined;
  const lines = cards?.map((c) => `${c.position}：${c.card.nameCn}（${c.upright ? "正位" : "逆位"}）`) ?? [];
  return {
    summary: `塔罗牌阵解读（娱乐参考）：${lines.join("；")}`,
    key_points: lines,
    advice: ["牌面提示关注当下可行动的方向，不必过度解读"],
    warnings: ["本地模板报告"],
    disclaimer: DISCLAIMER,
  };
}

export function buildFallbackZodiacReport(result: Record<string, unknown>): AiReport {
  const sign = result.sign as { name?: string } | undefined;
  const fortune = result.fortune as { summary?: string } | undefined;
  return {
    summary: fortune?.summary ?? `${sign?.name ?? "星座"}运势趋势（娱乐参考）`,
    key_points: ["同一日期同一星座输出稳定", "此为娱乐型趋势解读"],
    advice: ["以轻松心态阅读，不必对号入座"],
    warnings: ["本地模板报告"],
    disclaimer: DISCLAIMER,
  };
}

export function buildFallbackNameReport(result: Record<string, unknown>): AiReport {
  const score = result.nameScore as number | undefined;
  const grid = result.fiveGrid as Record<string, number> | undefined;
  return {
    summary: `姓名五格评分 ${score ?? "—"}（五格剖象法简化模型，仅供娱乐）`,
    key_points: grid
      ? Object.entries(grid).map(([k, v]) => `${k}：${v}`)
      : ["缺少笔画数据，无法完整分析"],
    advice: ["姓名学流派众多，结果仅供参考"],
    warnings: ["本地模板报告"],
    disclaimer: DISCLAIMER,
  };
}

export function buildFallbackLoveReport(result: Record<string, unknown>): AiReport {
  const score = result.matchScore as number | undefined;
  return {
    summary: `合盘匹配度 ${score ?? "—"}/100（相处模式参考，非关系定论）`,
    key_points: [
      "命理合盘仅描述可能的相处模式与风险点",
      "不包含必然结婚或分手结论",
    ],
    advice: ["重视沟通与边界，命理为辅"],
    warnings: ["本地模板报告"],
    disclaimer: DISCLAIMER,
  };
}
