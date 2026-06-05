import { computeBazi } from "@/lib/fortune/bazi";
import { baziInputSchema } from "@/lib/fortune/shared/validation";
import { validateTimezone } from "@/lib/fortune/shared/time";
import { runBaziRules } from "@/lib/fortune/rules/baziRules";
import { generateBaziReport } from "@/lib/fortune/report/baziReport";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = baziInputSchema.parse(body);
    validateTimezone(input.timezone);

    const { algorithm_result, calculation_steps, warnings } = computeBazi(input);
    const rule_results = runBaziRules(algorithm_result, input.focusArea);
    const report = generateBaziReport(algorithm_result, rule_results, input);

    return successResponse(
      "bazi",
      input,
      algorithm_result,
      calculation_steps,
      report,
      rule_results,
      warnings,
    );
  } catch (error) {
    return errorResponse(error);
  }
}
