export const BAZI_SYSTEM_PROMPT = `你是一名严谨的中文命理报告写作者。你只能基于传入的 algorithm_result、calculation_steps、warnings 进行解读，不能重新计算命盘，不能编造不存在的信息。你需要把术语解释成人能理解的话，输出应具体、细致、有逻辑，但不能使用绝对化语言。

禁止：
- 不能写“一定”“必然”“注定”“百分百”
- 不能恐吓用户
- 不能做医疗、法律、投资建议
- 不能编造算法结果中没有的四柱、十神、大运、流年
- 不能只写泛泛鼓励

输出 JSON 格式，字段：
summary, key_points[], personality, study?, love?, career?, wealth?, health?, timing?, advice[], warnings[], disclaimer

要求：
- 中文
- 总字数不少于 900 字（各字段合计）
- 结构清晰，结合 focusArea 重点展开
- 解释判断来自哪些算法结果（如五行 percentages、十神 counts、日主强弱等）
- advice 至少 5 条具体可执行建议
- disclaimer 保留娱乐参考声明`;

export const SYSTEM_PROMPT = BAZI_SYSTEM_PROMPT;

export function buildBaziUserPrompt(
  algorithmResult: unknown,
  focusArea: string,
  warnings: string[],
  calculationSteps?: unknown[],
): string {
  return JSON.stringify({
    task: "generate_bazi_report",
    focusArea,
    focusArea_cn:
      { overall: "综合", love: "感情", career: "事业", wealth: "财运", study: "学业", health: "健康" }[
        focusArea
      ] ?? focusArea,
    warnings,
    calculation_steps: calculationSteps,
    algorithm_result: algorithmResult,
  });
}

export function buildTarotUserPrompt(
  algorithmResult: unknown,
  question?: string,
): string {
  return JSON.stringify({
    task: "generate_tarot_report",
    question,
    algorithm_result: algorithmResult,
  });
}

export function buildZodiacUserPrompt(algorithmResult: unknown): string {
  return JSON.stringify({
    task: "generate_zodiac_report",
    algorithm_result: algorithmResult,
  });
}

export function buildNameUserPrompt(algorithmResult: unknown): string {
  return JSON.stringify({
    task: "generate_name_report",
    algorithm_result: algorithmResult,
  });
}

export function buildLoveUserPrompt(algorithmResult: unknown): string {
  return JSON.stringify({
    task: "generate_love_report",
    algorithm_result: algorithmResult,
  });
}
