import { NextResponse } from "next/server";
import { DISCLAIMER } from "@/lib/fortune/shared/constants";
import { toErrorResponse } from "@/lib/fortune/shared/errors";
import type {
  AiStatusPayload,
  FortuneSuccessResponse,
} from "@/lib/fortune/shared/types";

export function successResponse<TInput, TResult>(
  type: FortuneSuccessResponse<TInput, TResult>["type"],
  input: TInput,
  algorithm_result: TResult,
  calculation_steps: FortuneSuccessResponse<TInput, TResult>["calculation_steps"],
  ai_report: FortuneSuccessResponse<TInput, TResult>["ai_report"],
  warnings: string[] = [],
  ai_status?: AiStatusPayload,
): NextResponse {
  const body: FortuneSuccessResponse<TInput, TResult> = {
    success: true,
    type,
    input,
    algorithm_result,
    calculation_steps,
    ai_report,
    ai_status,
    warnings,
    disclaimer: DISCLAIMER,
  };
  return NextResponse.json(body);
}

export function errorResponse(error: unknown, status = 400): NextResponse {
  return NextResponse.json(toErrorResponse(error), { status });
}
