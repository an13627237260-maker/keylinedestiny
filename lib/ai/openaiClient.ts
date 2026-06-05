import OpenAI from "openai";

const DEFAULT_MODEL = "gpt-4.1-mini";
const TIMEOUT_MS = 30000;

export function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey, timeout: TIMEOUT_MS });
}

export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL ?? DEFAULT_MODEL;
}

export async function callOpenAI(
  systemPrompt: string,
  userContent: string,
): Promise<string | null> {
  const client = getOpenAIClient();
  if (!client) return null;

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
    return response.choices[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}
