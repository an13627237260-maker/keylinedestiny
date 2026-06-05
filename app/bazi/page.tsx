"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import type { BaziInput } from "@/lib/fortune/shared/validation";
import { generateAllLuckOverviews } from "@/lib/fortune/luck";
import type { LuckOverviewSet } from "@/lib/fortune/luck";
import { saveReport } from "@/lib/storage/localReports";
import {
  loadLastBaziInput,
  loadLastBaziResult,
  saveLastBaziResult,
  savedBaziInputsEqual,
  type BaziAnalysisResult,
  type SavedBaziFormInput,
  type SavedBaziResult,
} from "@/lib/storage/baziFormStorage";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";
import type { CalculationStep } from "@/lib/fortune/shared/types";
import type { FortuneReport } from "@/lib/fortune/shared/reportTypes";
import type { EvidenceItem } from "@/lib/fortune/rules/evidence";
import type { RuleResult } from "@/lib/fortune/shared/reportTypes";

function formatSavedAt(savedAt: string): string {
  const d = new Date(savedAt);
  if (Number.isNaN(d.getTime())) return savedAt;
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toSavedInput(
  input: BaziInput,
  algo: BaziAlgorithmResult,
): SavedBaziFormInput {
  const loc = algo.locationInfluence?.resolved;
  return {
    name: input.name,
    gender: input.gender,
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    province: input.province,
    city: input.city,
    birthPlace: input.birthPlace ?? input.birthPlaceNote,
    latitude: input.manualLatitude ?? input.latitude ?? loc?.latitude,
    longitude: input.manualLongitude ?? input.longitude ?? loc?.longitude,
    timezone: input.timezone,
    useTrueSolarTime: input.useTrueSolarTime,
    focusArea: input.focusArea,
    targetYear: input.targetYear,
    dayBoundaryMode: input.options?.dayBoundaryMode ?? "midnight",
    savedAt: new Date().toISOString(),
    version: 1,
  };
}

function uniqueEvidence(items: EvidenceItem[], limit: number): EvidenceItem[] {
  const byId = new Map<string, EvidenceItem>();
  for (const item of items) {
    if (!byId.has(item.id)) byId.set(item.id, item);
  }
  return [...byId.values()]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}

function buildEvidenceStep(
  ruleResults: RuleResult[],
  report: FortuneReport,
  luckOverview: LuckOverviewSet,
): CalculationStep {
  const overviews = Object.values(luckOverview) as LuckOverviewSet[keyof LuckOverviewSet][];
  const ruleEvidence = uniqueEvidence(ruleResults.flatMap((r) => r.evidence), 20);
  const reportEvidence = uniqueEvidence(
    report.sections.flatMap((section) => section.evidence ?? []),
    20,
  );
  const luckEvidence = uniqueEvidence(
    overviews.flatMap((overview) =>
      overview.scores.flatMap((score) => score.evidence.slice(0, 2)),
    ),
    24,
  );

  return {
    step: "evidence_sources",
    title: "证据来源",
    input: {
      ruleResultCount: ruleResults.length,
      reportSectionCount: report.sections.length,
      luckPeriods: Object.keys(luckOverview),
    },
    method: "汇总 rule_results、report.sections.evidence 与 luckOverview.scores.evidence，供报告和运势分数追溯",
    result: {
      ruleEvidence,
      reportEvidence,
      luckEvidence,
      scoreBreakdownNotes: overviews.flatMap((overview) =>
        overview.scores.map((score) => ({
          id: `${overview.period}-${score.category}`,
          title: `${overview.period}/${score.label}`,
          source: "score_model",
          detail: `base ${score.scoreBreakdown.base}，大运 ${score.scoreBreakdown.luckCycleImpact}，流年 ${score.scoreBreakdown.yearImpact}，流月 ${score.scoreBreakdown.monthImpact}，流日 ${score.scoreBreakdown.dayImpact}，喜用 ${score.scoreBreakdown.usefulGodImpact}，关系 ${score.scoreBreakdown.relationImpact}，地域 ${score.scoreBreakdown.locationImpact}，周期 ${score.scoreBreakdown.periodHashAdjustment}，final ${score.scoreBreakdown.final}`,
        })),
      ),
    },
    notes: ["没有 evidence 的规则不会进入 rule_results；没有依据的报告段落不会生成。"],
  };
}

export default function BaziPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BaziAnalysisResult | {
    algorithm_result: BaziAlgorithmResult;
    calculation_steps: CalculationStep[];
    report: FortuneReport;
    input?: { focusArea?: string };
  } | null>(null);
  const [restoredResultSavedAt, setRestoredResultSavedAt] = useState("");
  const [staleResultNotice, setStaleResultNotice] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const lastResultRef = useRef<SavedBaziResult | null>(null);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  useEffect(() => {
    const lastInput = loadLastBaziInput();
    const lastResult = loadLastBaziResult();
    if (lastInput && lastResult && savedBaziInputsEqual(lastInput, lastResult.input)) {
      lastResultRef.current = lastResult;
      setResult(lastResult.result);
      setRestoredResultSavedAt(lastResult.savedAt);
      setStaleResultNotice(false);
    }
  }, []);

  const handleInputChange = useCallback((input: SavedBaziFormInput | null) => {
    const saved = lastResultRef.current;
    if (!saved) return;

    if (input && savedBaziInputsEqual(input, saved.input)) {
      setResult(saved.result);
      setRestoredResultSavedAt(saved.savedAt);
      setStaleResultNotice(false);
      return;
    }

    setResult((current) => (current === saved.result ? null : current));
    setRestoredResultSavedAt("");
    setStaleResultNotice(true);
  }, []);

  const handleClear = useCallback(() => {
    lastResultRef.current = null;
    setResult(null);
    setError("");
    setRestoredResultSavedAt("");
    setStaleResultNotice(false);
  }, []);

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
      birthPlace: (fd.get("birthPlace") as string) || undefined,
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
      const stepsWithEvidence = [
        ...calculation_steps,
        buildEvidenceStep(rule_results, report, luckOverview),
      ];
      const data: BaziAnalysisResult = {
        ...buildFortuneSuccess(
          "bazi",
          input,
          algorithm_result,
          stepsWithEvidence,
          report,
          rule_results,
          warnings,
        ),
        luckOverview,
      };
      const savedInput = toSavedInput(input, algorithm_result);

      setResult(data);
      lastResultRef.current = {
        input: savedInput,
        result: data,
        savedAt: new Date().toISOString(),
        version: 1,
      };
      setRestoredResultSavedAt("");
      setStaleResultNotice(false);
      saveLastBaziResult(savedInput, data);
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
        <BaziForm
          loading={loading}
          onSubmit={onSubmit}
          onInputChange={handleInputChange}
          onClear={handleClear}
        />
        <div ref={resultsRef} className="min-w-0">
          {restoredResultSavedAt && (
            <p className="mb-4 rounded-lg border border-[var(--border-soft)] bg-[rgba(139,92,246,0.06)] px-4 py-3 text-sm text-[var(--text-muted)]">
              已加载上次排盘结果 · 保存于 {formatSavedAt(restoredResultSavedAt)}
            </p>
          )}
          {staleResultNotice && (
            <p className="mb-4 rounded-lg border border-[var(--gold-main)]/30 bg-[rgba(214,181,109,0.08)] px-4 py-3 text-sm text-[var(--gold-main)]">
              信息已修改，请重新排盘
            </p>
          )}
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
                focusArea={(result.input as { focusArea?: string } | undefined)?.focusArea}
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
