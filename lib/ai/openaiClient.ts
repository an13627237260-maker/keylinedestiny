import OpenAI from "openai";

const DEFAULT_MODEL = "gpt-4.1-mini";
const TIMEOUT_MS = 45000;

export type OpenAICallResult =
  | { ok: true; content: string }
  | { ok: false; reason: string };

export function hasOpenAIApiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  return new OpenAI({ apiKey, timeout: TIMEOUT_MS });
}

export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL ?? DEFAULT_MODEL;
}

export async function callOpenAI(
  systemPrompt: string,
  userContent: string,
): Promise<OpenAICallResult> {
  if (!hasOpenAIApiKey()) {
    return {
      ok: false,
      reason: "当前未配置 OpenAI API Key，因此使用本地命理模板生成报告。",
    };
  }

  const client = getOpenAIClient();
  if (!client) {
    return {
      ok: false,
      reason: "OpenAI 客户端初始化失败，因此使用本地命理模板生成报告。",
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: getOpenAIModel(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        ok: false,
        reason: "OpenAI 返回空内容，因此使用本地命理模板生成报告。",
      };
    }
    return { ok: true, content };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "未知网络或服务错误";
    const safe = message.replace(/sk-[a-zA-Z0-9_-]+/g, "[已隐藏]");
    return {
      ok: false,
      reason: `OpenAI 请求失败：${safe}`,
    };
  }
}
