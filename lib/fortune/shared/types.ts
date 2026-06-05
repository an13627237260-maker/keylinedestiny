import { FORTUNE_TYPES } from "./constants";
import type { FortuneReport, RuleResult } from "./reportTypes";

export type FortuneType = (typeof FORTUNE_TYPES)[number];

export interface CalculationStep {
  step: string;
  title: string;
  input: Record<string, unknown>;
  method: string;
  result: Record<string, unknown>;
  notes: string[];
}

export interface FortuneSuccessResponse<TInput, TResult> {
  success: true;
  type: FortuneType;
  input: TInput;
  algorithm_result: TResult;
  rule_results: RuleResult[];
  report: FortuneReport;
  calculation_steps: CalculationStep[];
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
