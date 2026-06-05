import { DISCLAIMER } from "@/lib/fortune/shared/constants";
import type { FortuneReport, RuleResult } from "@/lib/fortune/shared/reportTypes";
import type {
  CalculationStep,
  FortuneSuccessResponse,
  FortuneType,
} from "@/lib/fortune/shared/types";

export function buildFortuneSuccess<TInput, TResult>(
  type: FortuneType,
  input: TInput,
  algorithm_result: TResult,
  calculation_steps: CalculationStep[],
  report: FortuneReport,
  rule_results: RuleResult[] = [],
  warnings: string[] = [],
): FortuneSuccessResponse<TInput, TResult> {
  return {
    success: true,
    type,
    input,
    algorithm_result,
    rule_results,
    report,
    calculation_steps,
    warnings,
    disclaimer: DISCLAIMER,
  };
}
