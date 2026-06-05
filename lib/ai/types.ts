export interface AiStatus {
  provider: "openai" | "fallback";
  reason: string;
  model?: string;
  consistency_passed: boolean;
  display_label?: string;
}

export function getAiStatusDisplayLabel(status: AiStatus): string {
  if (status.provider === "openai" && status.consistency_passed) {
    return "OpenAI 已启用";
  }
  if (status.reason.includes("未配置 OpenAI API Key")) {
    return "OpenAI API Key 未配置";
  }
  if (status.provider === "fallback" && !status.consistency_passed) {
    return "OpenAI 输出未通过一致性检查，使用本地模板";
  }
  return "OpenAI 不可用，使用本地模板";
}
