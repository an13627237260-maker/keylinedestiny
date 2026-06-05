import { analyzeLoveCompatibility } from "@/lib/fortune/bazi/compatibility";
import { loveInputSchema } from "@/lib/fortune/shared/validation";
import { generateLoveReport } from "@/lib/fortune/report/loveReport";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = loveInputSchema.parse(body);
    const { result, steps } = analyzeLoveCompatibility(input.personA, input.personB);
    const report = generateLoveReport(result);

    return successResponse("love", input, result, steps, report, []);
  } catch (error) {
    return errorResponse(error);
  }
}
