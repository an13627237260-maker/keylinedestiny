import { generateZodiacFortune, getZodiacById, getZodiacSign } from "@/lib/fortune/zodiac";
import { zodiacInputSchema } from "@/lib/fortune/shared/validation";
import { generateZodiacReport } from "@/lib/fortune/report/zodiacReport";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = zodiacInputSchema.parse(body);
    const date = input.date ?? new Date().toISOString().slice(0, 10);

    const sign = input.zodiacSign
      ? getZodiacById(input.zodiacSign) ?? getZodiacSign(input.birthDate ?? date)
      : getZodiacSign(input.birthDate ?? date);

    const fortune = generateZodiacFortune(sign, input.period, date);
    const algorithm_result = { sign, fortune, period: input.period, date };
    const report = generateZodiacReport(algorithm_result);

    return successResponse(
      "zodiac",
      input,
      algorithm_result,
      [
        {
          step: "zodiac_fortune",
          title: "星座运势",
          input: { sign: sign.id, date, period: input.period },
          method: "deterministic seed = date + sign + period",
          result: { seed: fortune.seed, themes: fortune.themes },
          notes: ["娱乐型趋势解读，同一天同星座输出稳定"],
        },
      ],
      report,
      [],
    );
  } catch (error) {
    return errorResponse(error);
  }
}
