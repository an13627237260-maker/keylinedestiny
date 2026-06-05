"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { SectionTitle } from "@/components/ui/section-title";
import { PillBadge } from "@/components/ui/pill-badge";
import { BaziForm } from "@/components/bazi/BaziForm";
import { BaziResultPanels } from "@/components/bazi/bazi-result-panels";
import { EmptyBaziState } from "@/components/bazi/EmptyBaziState";
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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name") as string,
      gender: fd.get("gender"),
      birthDate: fd.get("birthDate"),
      birthTime: fd.get("birthTime"),
      birthPlace: fd.get("birthPlace"),
      longitude: fd.get("longitude") ? Number(fd.get("longitude")) : undefined,
      timezone: fd.get("timezone") || "Asia/Shanghai",
      useTrueSolarTime: fd.get("useTrueSolarTime") === "on",
      focusArea: fd.get("focusArea") || "overall",
      targetYear: fd.get("targetYear") ? Number(fd.get("targetYear")) : undefined,
      options: { dayBoundaryMode: fd.get("dayBoundaryMode") || "midnight" },
    };

    try {
      const res = await fetch("/api/bazi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message ?? "请求失败");
      setResult(data);
      saveReport("bazi", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-8">
        <SectionTitle
          eyebrow="生辰八字"
          title="生辰八字测算"
          subtitle="以节气、四柱、五行、十神、大运为基础，由本地规则引擎生成可复核的命理报告"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <PillBadge variant="purple">本地规则引擎</PillBadge>
          <PillBadge variant="gold">计算过程可展开</PillBadge>
          <PillBadge variant="muted">传统命理模型</PillBadge>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,38%)_minmax(0,62%)]">
        <BaziForm loading={loading} onSubmit={onSubmit} />
        <div>
          {error && (
            <p className="mb-4 rounded-lg border border-[var(--danger)]/30 bg-[rgba(224,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </p>
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
