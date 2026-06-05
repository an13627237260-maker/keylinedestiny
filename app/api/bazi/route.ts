import { computeBazi } from "@/lib/fortune/bazi";
import { baziInputSchema } from "@/lib/fortune/shared/validation";
import { validateTimezone } from "@/lib/fortune/shared/time";
import { generateBaziReport } from "@/lib/ai/reportGenerator";
import { successResponse, errorResponse } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = baziInputSchema.parse(body);
    validateTimezone(input.timezone);

    const { algorithm_result, calculation_steps, warnings } = computeBazi(input);
    const ai = await generateBaziReport(
      algorithm_result,
      input.focusArea,
      warnings,
      calculation_steps,
    );

    try {
      await prisma.fortuneReport.create({
        data: {
          type: "bazi",
          inputData: JSON.stringify(input),
          algorithmResult: JSON.stringify(algorithm_result),
          calculationSteps: JSON.stringify(calculation_steps),
          aiReport: JSON.stringify({ report: ai.report, ai_status: ai.ai_status }),
          warnings: JSON.stringify(warnings),
        },
      });
    } catch {
      // DB optional for local dev
    }

    return successResponse(
      "bazi",
      input,
      algorithm_result,
      calculation_steps,
      ai.text,
      warnings,
      ai.ai_status,
    );
  } catch (error) {
    return errorResponse(error);
  }
}
