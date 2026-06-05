"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { SectionTitle } from "@/components/ui/section-title";
import { PillBadge } from "@/components/ui/pill-badge";
import { BaziForm } from "@/components/bazi/BaziForm";
import { BaziResultPanels } from "@/components/bazi/bazi-result-panels";
import { EmptyBaziState } from "@/components/bazi/EmptyBaziState";
import { buildFortuneSuccess } from "@/lib/client/fortuneResponse";
import { computeBazi } from "@/lib/fortune/bazi";
import { runBaziRules } from "@/lib/fortune/rules/baziRules";
import { generateBaziReport } from "@/lib/fortune/report/baziReport";
import { toErrorResponse } from "@/lib/fortune/shared/errors";
import { validateTimezone } from "@/lib/fortune/shared/time";
import { baziInputSchema } from "@/lib/fortune/shared/validation";
import { generateAllLuckOverviews } from "@/lib/fortune/luck";
import { saveReport } from "@/lib/storage/localReports";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";
import type { CalculationStep } from "@/lib/fortune/shared/types";
import type { FortuneReport } from "@/lib/fortune/shared/reportTypes";

export default function BaziPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    algorithm_result: BaziAlgorithmResult;
    calculation_steps: CalculationStep[];
    report: FortuneReport;
    input?: { focusArea?: string };
  } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      name: (fd.get("name") as string) || undefined,
      gender: fd.get("gender"),
      birthDate: fd.get("birthDate"),
      birthTime: fd.get("birthTime"),
      province: (fd.get("province") as string) || undefined,
      city: (fd.get("city") as string) || undefined,
      birthPlaceNote: (fd.get("birthPlaceNote") as string) || undefined,
      locationUnknown: fd.get("locationUnknown") === "on",
      manualLongitude: fd.get("manualLongitude")
        ? Number(fd.get("manualLongitude"))
        : undefined,
      manualLatitude: fd.get("manualLatitude")
        ? Number(fd.get("manualLatitude"))
        : undefined,
      timezone: (fd.get("timezone") as string) || "Asia/Shanghai",
      useTrueSolarTime: fd.get("useTrueSolarTime") === "on",
      focusArea: (fd.get("focusArea") as string) || "overall",
      targetYear: fd.get("targetYear") ? Number(fd.get("targetYear")) : undefined,
      options: { dayBoundaryMode: (fd.get("dayBoundaryMode") as string) || "midnight" },
    };

    try {
      const input = baziInputSchema.parse(body);
      validateTimezone(input.timezone);

      const { algorithm_result, calculation_steps, warnings } = computeBazi(input);
      const rule_results = runBaziRules(algorithm_result, input.focusArea);
      const report = generateBaziReport(algorithm_result, rule_results, input);
      const luckOverview = generateAllLuckOverviews(
        algorithm_result,
        input.focusArea,
      );
      const data = {
        ...buildFortuneSuccess(
          "bazi",
          input,
          algorithm_result,
          calculation_steps,
          report,
          rule_results,
          warnings,
        ),
        luckOverview,
      };

      setResult(data);
      saveReport("bazi", data);
    } catch (err) {
      setError(toErrorResponse(err).error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-4 md:mb-8">
        <SectionTitle
          eyebrow="生辰八字"
          title="生辰八字测算"
          subtitle="以节气、四柱、五行、十神、大运为基础，由本地规则引擎生成可复核的命理报告"
        />
        <div className="mt-3 flex flex-wrap gap-2 md:mt-4">
          <PillBadge variant="purple">本地规则引擎</PillBadge>
          <PillBadge variant="gold">计算过程可展开</PillBadge>
          <PillBadge variant="muted">传统命理模型</PillBadge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-[minmax(0,38%)_minmax(0,62%)]">
        <BaziForm loading={loading} onSubmit={onSubmit} />
        <div ref={resultsRef} className="min-w-0">
          {error && (
            <p className="mb-4 rounded-lg border border-[var(--danger)]/30 bg-[rgba(224,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </p>
          )}
          {loading && !result && (
            <p className="mb-4 text-center text-sm text-[var(--text-muted)]">正在校准节气与四柱…</p>
          )}
          {result ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <BaziResultPanels
                algo={result.algorithm_result}
                report={result.report}
                calculationSteps={result.calculation_steps}
                focusArea={result.input?.focusArea}
              />
            </motion.div>
          ) : (
            <EmptyBaziState />
          )}
        </div>
      </div>
    </AppShell>
  );
}
