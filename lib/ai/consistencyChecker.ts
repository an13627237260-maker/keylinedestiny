import { AI_FORBIDDEN_WORDS, DISCLAIMER } from "@/lib/fortune/shared/constants";
import type { AiReport } from "./schemas";
import { aiReportSchema } from "./schemas";

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

const STEMS = "甲乙丙丁戊己庚辛壬癸";
const BRANCHES = "子丑寅卯辰巳午未申酉戌亥";

export function detectFabricatedBazi(text: string, algorithmJson: string): boolean {
  const algoStems = [...algorithmJson.matchAll(/[甲乙丙丁戊己庚辛壬癸]/g)].map(
    (m) => m[0],
  );
  const textStems = [...text.matchAll(/[甲乙丙丁戊己庚辛壬癸]/g)].map((m) => m[0]);

  const algoBranches = [...algorithmJson.matchAll(/[子丑寅卯辰巳午未申酉戌亥]/g)].map(
    (m) => m[0],
  );
  const textBranches = [...text.matchAll(/[子丑寅卯辰巳午未申酉戌亥]/g)].map(
    (m) => m[0],
  );

  const extraStems = textStems.filter((s) => !algoStems.includes(s));
  const extraBranches = textBranches.filter((b) => !algoBranches.includes(b));

  return extraStems.length > 4 || extraBranches.length > 4;
}

export function validateAiReport(
  raw: string,
  algorithmResult: unknown,
): { ok: true; report: AiReport } | { ok: false; reason: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "AI 输出非合法 JSON" };
  }

  const result = aiReportSchema.safeParse(parsed);
  if (!result.success) {
    return { ok: false, reason: "AI 输出不符合 schema" };
  }

  const fullText = JSON.stringify(result.data);
  const forbidden = containsForbiddenWords(fullText);
  if (forbidden.length > 0) {
    return { ok: false, reason: `含禁止词：${forbidden.join("、")}` };
  }

  const algoJson = JSON.stringify(algorithmResult);
  if (detectFabricatedBazi(fullText, algoJson)) {
    return { ok: false, reason: "AI 可能编造了命盘硬数据" };
  }

  return { ok: true, report: result.data };
}

export function formatAiReportAsText(report: AiReport): string {
  const sections = [
    report.summary,
    ...report.key_points.map((p) => `• ${p}`),
    report.personality && `性格：${report.personality}`,
    report.love && `感情：${report.love}`,
    report.career && `事业：${report.career}`,
    report.wealth && `财运：${report.wealth}`,
    report.study && `学业：${report.study}`,
    report.health && `健康：${report.health}`,
    report.timing && `时机：${report.timing}`,
    ...report.advice.map((a) => `建议：${a}`),
    ...report.warnings.map((w) => `提醒：${w}`),
    report.disclaimer,
  ].filter(Boolean);
  return sections.join("\n\n");
}

export function buildFallbackBaziReport(
  algorithmResult: Record<string, unknown>,
  focusArea: string,
): AiReport {
  const pillars = algorithmResult.pillarStrings as Record<string, string> | undefined;
  const five = algorithmResult.fiveElements as { strongestElement?: string; weakestElement?: string } | undefined;
  const dm = algorithmResult.dayMasterStrength as { strengthLevel?: string; dayMaster?: string } | undefined;

  return {
    summary: `命盘四柱：${pillars ? Object.values(pillars).join(" ") : "见算法结果"}。以下解读基于传统规则计算结果，仅供娱乐参考。`,
    key_points: [
      `日主 ${dm?.dayMaster ?? "—"}，强弱倾向：${dm?.strengthLevel ?? "balanced"}`,
      `五行较强：${five?.strongestElement ?? "—"}，较弱：${five?.weakestElement ?? "—"}`,
      `关注方向：${focusArea}`,
    ],
    personality: "性格倾向需结合十神与五行平衡综合理解，此处为简化概述。",
    advice: [
      "将命理结果当作自我觉察的参考角度",
      "重要决策请结合现实情况与专业意见",
    ],
    warnings: ["本报告为本地模板生成，OpenAI 不可用或一致性检查未通过"],
    disclaimer: DISCLAIMER,
  };
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
