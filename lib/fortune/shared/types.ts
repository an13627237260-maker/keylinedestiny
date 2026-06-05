import { FORTUNE_TYPES } from "./constants";

export type FortuneType = (typeof FORTUNE_TYPES)[number];

export interface CalculationStep {
  step: string;
  title: string;
  input: Record<string, unknown>;
  method: string;
  result: Record<string, unknown>;
  notes: string[];
}

export interface AiStatusPayload {
  provider: "openai" | "fallback";
  reason: string;
  model?: string;
  consistency_passed: boolean;
  display_label?: string;
}

export interface FortuneSuccessResponse<TInput, TResult> {
  success: true;
  type: FortuneType;
  input: TInput;
  algorithm_result: TResult;
  calculation_steps: CalculationStep[];
  ai_report: string | Record<string, unknown>;
  ai_status?: AiStatusPayload;
  warnings: string[];
  disclaimer: string;
}

export interface FortuneErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type FortuneResponse<TInput, TResult> =
  | FortuneSuccessResponse<TInput, TResult>
  | FortuneErrorResponse;

export interface AiReportSchema {
  summary: string;
  key_points: string[];
  personality?: string;
  love?: string;
  career?: string;
  wealth?: string;
  study?: string;
  health?: string;
  timing?: string;
  advice: string[];
  warnings: string[];
  disclaimer: string;
}
