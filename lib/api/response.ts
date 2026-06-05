import { NextResponse } from "next/server";
import { DISCLAIMER } from "@/lib/fortune/shared/constants";
import { toErrorResponse } from "@/lib/fortune/shared/errors";
import type { FortuneReport, RuleResult } from "@/lib/fortune/shared/reportTypes";
import type { FortuneSuccessResponse } from "@/lib/fortune/shared/types";

export function successResponse<TInput, TResult>(
  type: FortuneSuccessResponse<TInput, TResult>["type"],
  input: TInput,
  algorithm_result: TResult,
  calculation_steps: FortuneSuccessResponse<TInput, TResult>["calculation_steps"],
  report: FortuneReport,
  rule_results: RuleResult[] = [],
  warnings: string[] = [],
): NextResponse {
  const body: FortuneSuccessResponse<TInput, TResult> = {
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
  return NextResponse.json(body);
}

export function errorResponse(error: unknown, status = 400): NextResponse {
  return NextResponse.json(toErrorResponse(error), { status });
}
