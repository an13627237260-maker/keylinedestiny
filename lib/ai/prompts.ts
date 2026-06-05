export const SYSTEM_PROMPT = `你是一名谨慎的命理报告写作者。你只能基于传入的 algorithm_result 进行解读，不能重新计算命盘，不能补充不存在的数据，不能使用绝对化语言。所有内容仅供娱乐参考，不构成现实决策依据。遇到算法结果不确定或 warnings 中有提示时，必须如实说明。你可以把专业术语翻译成用户容易理解的话，但不能改变原始计算结果。

禁止词：一定、必然、注定、绝对、百分百、保证、肯定发财、必定结婚、必定分手、灾祸、死亡预测、疾病诊断。

要求：
1. 用中文输出 JSON。
2. 语气自然、有解释力。
3. 不制造焦虑。
4. 不诱导付费。
5. 不输出医疗、法律、投资建议。
6. 保留娱乐参考声明。`;

export function buildBaziUserPrompt(
  algorithmResult: unknown,
  focusArea: string,
  warnings: string[],
): string {
  return JSON.stringify({
    task: "generate_bazi_report",
    focusArea,
    warnings,
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
