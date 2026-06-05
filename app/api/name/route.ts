import { analyzeName } from "@/lib/fortune/name";
import { nameInputSchema } from "@/lib/fortune/shared/validation";
import { generateNameReport } from "@/lib/ai/reportGenerator";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = nameInputSchema.parse(body);
    const { algorithm_result, calculation_steps, warnings } = analyzeName(
      input.name,
      input.script,
    );
    const ai = await generateNameReport(algorithm_result);

    return successResponse(
      "name",
      input,
      algorithm_result,
      calculation_steps,
      ai.text,
      warnings,
    );
  } catch (error) {
    return errorResponse(error);
  }
}
