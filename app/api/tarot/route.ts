import { drawTarotReading } from "@/lib/fortune/tarot";
import { tarotInputSchema } from "@/lib/fortune/shared/validation";
import { generateTarotReport } from "@/lib/ai/reportGenerator";
import { successResponse, errorResponse } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = tarotInputSchema.parse(body);
    const { result, steps } = drawTarotReading(
      input.spread,
      input.question,
      input.seed,
    );
    const ai = await generateTarotReport(result, input.question);

    try {
      await prisma.tarotReading.create({
        data: {
          question: input.question ?? "",
          spreadType: input.spread,
          cards: JSON.stringify(result.cards),
          algorithmResult: JSON.stringify(result),
          aiReport: JSON.stringify(ai.report),
        },
      });
    } catch {
      // DB optional
    }

    return successResponse("tarot", input, result, steps, ai.text);
  } catch (error) {
    return errorResponse(error);
  }
}
