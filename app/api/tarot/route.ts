import { drawTarotReading } from "@/lib/fortune/tarot";
import { tarotInputSchema } from "@/lib/fortune/shared/validation";
import { generateTarotReport } from "@/lib/fortune/report/tarotReport";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = tarotInputSchema.parse(body);
    const { result, steps } = drawTarotReading(
      input.spread,
      input.question,
      input.seed,
    );
    const report = generateTarotReport(result, input.question);

    return successResponse("tarot", input, result, steps, report, []);
  } catch (error) {
    return errorResponse(error);
  }
}
