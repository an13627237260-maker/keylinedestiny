import { prisma } from "@/lib/db/prisma";
import { successResponse, errorResponse } from "@/lib/api/response";
import { DISCLAIMER } from "@/lib/fortune/shared/constants";

export async function GET() {
  try {
    const reports = await prisma.fortuneReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const tarot = await prisma.tarotReading.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return successResponse(
      "bazi",
      {},
      {
        fortuneReports: reports.map((r) => ({
          id: r.id,
          type: r.type,
          createdAt: r.createdAt,
          inputData: JSON.parse(r.inputData),
          algorithmResult: JSON.parse(r.algorithmResult),
          calculationSteps: JSON.parse(r.calculationSteps),
          aiReport: r.aiReport ? JSON.parse(r.aiReport) : null,
          warnings: r.warnings ? JSON.parse(r.warnings) : [],
        })),
        tarotReadings: tarot.map((t) => ({
          id: t.id,
          question: t.question,
          spreadType: t.spreadType,
          createdAt: t.createdAt,
          cards: JSON.parse(t.cards),
          algorithmResult: JSON.parse(t.algorithmResult),
          aiReport: t.aiReport ? JSON.parse(t.aiReport) : null,
        })),
      },
      [],
      "",
      [],
    );
  } catch {
    return successResponse("bazi", {}, { fortuneReports: [], tarotReadings: [] }, [], "", []);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const report = await prisma.fortuneReport.create({
      data: {
        type: body.type ?? "bazi",
        inputData: JSON.stringify(body.input ?? {}),
        algorithmResult: JSON.stringify(body.algorithm_result ?? {}),
        calculationSteps: JSON.stringify(body.calculation_steps ?? []),
        aiReport: JSON.stringify(body.ai_report ?? ""),
        warnings: JSON.stringify(body.warnings ?? []),
      },
    });
    return successResponse("bazi", body.input, { id: report.id }, [], DISCLAIMER);
  } catch (error) {
    return errorResponse(error);
  }
}
