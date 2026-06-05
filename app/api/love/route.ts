import { analyzeLoveCompatibility } from "@/lib/fortune/bazi/compatibility";
import { loveInputSchema } from "@/lib/fortune/shared/validation";
import { generateLoveReport } from "@/lib/ai/reportGenerator";
import { successResponse, errorResponse } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = loveInputSchema.parse(body);
    const { result, steps } = analyzeLoveCompatibility(input.personA, input.personB);
    const ai = await generateLoveReport(result);

    try {
      await prisma.fortuneReport.create({
        data: {
          type: "love",
          inputData: JSON.stringify(input),
          algorithmResult: JSON.stringify(result),
          calculationSteps: JSON.stringify(steps),
          aiReport: JSON.stringify(ai.report),
          warnings: JSON.stringify([]),
        },
      });
    } catch {
      // DB optional
    }

    return successResponse("love", input, result, steps, ai.text);
  } catch (error) {
    return errorResponse(error);
  }
}
