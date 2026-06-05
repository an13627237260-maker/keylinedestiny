"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { SectionTitle } from "@/components/ui/section-title";
import { MysticCard } from "@/components/ui/mystic-card";
import { MysticButton } from "@/components/ui/mystic-button";
import { FormFieldShell } from "@/components/ui/form-field-shell";
import { PillBadge } from "@/components/ui/pill-badge";
import { ReportSections } from "@/components/ui/ReportSections";
import { buildFortuneSuccess } from "@/lib/client/fortuneResponse";
import {
  analyzeLoveCompatibility,
  type LoveCompatibilityResult,
} from "@/lib/fortune/bazi/compatibility";
import { generateLoveReport } from "@/lib/fortune/report/loveReport";
import { toErrorResponse } from "@/lib/fortune/shared/errors";
import { loveInputSchema } from "@/lib/fortune/shared/validation";
import { saveReport } from "@/lib/storage/localReports";
import type { FortuneReport } from "@/lib/fortune/shared/reportTypes";

const inputClass =
  "mystic-input min-h-[44px] w-full rounded-lg px-3 text-base sm:text-sm";

function PersonFields({ prefix, label }: { prefix: string; label: string }) {
  return (
    <MysticCard title={label}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <FormFieldShell label="出生日期" htmlFor={`${prefix}_birthDate`}>
          <input
            id={`${prefix}_birthDate`}
            name={`${prefix}_birthDate`}
            type="date"
            required
            defaultValue="1990-05-15"
            className={inputClass}
          />
        </FormFieldShell>
        <FormFieldShell label="出生时间" htmlFor={`${prefix}_birthTime`}>
          <input
            id={`${prefix}_birthTime`}
            name={`${prefix}_birthTime`}
            type="time"
            required
            defaultValue="10:00"
            className={inputClass}
          />
        </FormFieldShell>
        <FormFieldShell label="性别" htmlFor={`${prefix}_gender`}>
          <select
            id={`${prefix}_gender`}
            name={`${prefix}_gender`}
            defaultValue="unknown"
            className={inputClass}
          >
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="unknown">未说明</option>
          </select>
        </FormFieldShell>
        <FormFieldShell label="时区" htmlFor={`${prefix}_timezone`}>
          <input
            id={`${prefix}_timezone`}
            name={`${prefix}_timezone`}
            defaultValue="Asia/Shanghai"
            className={inputClass}
          />
        </FormFieldShell>
      </div>
    </MysticCard>
  );
}

export default function LovePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    algorithm_result: LoveCompatibilityResult;
    report: FortuneReport;
  } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const person = (p: string) => ({
      gender: fd.get(`${p}_gender`),
      birthDate: fd.get(`${p}_birthDate`),
      birthTime: fd.get(`${p}_birthTime`),
      timezone: (fd.get(`${p}_timezone`) as string) || "Asia/Shanghai",
      useTrueSolarTime: false,
      focusArea: "love" as const,
    });

    try {
      const input = loveInputSchema.parse({
        personA: person("a"),
        personB: person("b"),
      });
      const { result: algoResult, steps } = analyzeLoveCompatibility(input.personA, input.personB);
      const report = generateLoveReport(algoResult);
      const data = buildFortuneSuccess("love", input, algoResult, steps, report);

      setResult(data);
      saveReport("love", data);
    } catch (err) {
      setError(toErrorResponse(err).error.message);
    } finally {
      setLoading(false);
    }
  }

  const algo = result?.algorithm_result;
  const score = algo?.matchScore;

  return (
    <AppShell>
      <SectionTitle
        eyebrow="情感合盘"
        title="双人合盘"
        subtitle="八字五行互补 · 相处倾向分析 · 不作绝对论断"
        className="mb-4 md:mb-0"
      />

      <form onSubmit={onSubmit} className="mt-4 space-y-4 md:mt-8 md:space-y-6">
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
          <PersonFields prefix="a" label="甲方命盘" />
          <PersonFields prefix="b" label="乙方命盘" />
        </div>
        {error && (
          <p className="rounded-lg border border-[var(--danger)]/30 bg-[rgba(224,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </p>
        )}
        <MysticButton type="submit" loading={loading} variant="primary" className="w-full sm:w-auto">
          开始合盘
        </MysticButton>
      </form>

      {algo && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-4 md:mt-10 md:space-y-6">
          <MysticCard highlighted className="text-center">
            <p className="text-xs text-[var(--text-dim)]">匹配度</p>
            <p className="font-display text-4xl font-bold text-[var(--gold-main)] sm:text-5xl">{score}</p>
            <p className="text-sm text-[var(--text-muted)]">/ 100</p>
            <div className="mx-auto mt-4 h-2.5 max-w-xs overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--purple-deep)] to-[var(--gold-main)]"
                style={{ width: `${score ?? 0}%` }}
              />
            </div>
          </MysticCard>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <MysticCard title="甲方">
              <p className="text-sm text-[var(--text-muted)]">{algo.personA.pillars}</p>
              <p className="mt-2 text-xs text-[var(--text-dim)]">
                日主 <span className="text-[var(--gold-main)]">{algo.personA.dayMaster}</span>
              </p>
            </MysticCard>
            <MysticCard title="乙方">
              <p className="text-sm text-[var(--text-muted)]">{algo.personB.pillars}</p>
              <p className="mt-2 text-xs text-[var(--text-dim)]">
                日主 <span className="text-[var(--gold-main)]">{algo.personB.dayMaster}</span>
              </p>
            </MysticCard>
          </div>

          <MysticCard title="吸引力">
            <ul className="space-y-2 text-sm leading-7 text-[var(--text-muted)]">
              {algo.attractionPoints.map((p, i) => (
                <li key={i}>· {p}</li>
              ))}
            </ul>
          </MysticCard>

          <MysticCard title="摩擦点">
            <ul className="space-y-2 text-sm leading-7 text-[var(--text-muted)]">
              {algo.conflictPoints.map((p, i) => (
                <li key={i}>· {p}</li>
              ))}
            </ul>
          </MysticCard>

          <MysticCard title="五行互补">
            <div className="flex flex-wrap gap-2">
              {algo.complementaryElements.map((el) => (
                <PillBadge key={el} variant="gold">
                  {el}
                </PillBadge>
              ))}
              {algo.complementaryElements.length === 0 && (
                <p className="text-sm text-[var(--text-dim)]">暂无显著互补标签</p>
              )}
            </div>
          </MysticCard>

          {result?.report && (
            <MysticCard title="合盘报告">
              <p className="mb-4 text-sm leading-7 text-[var(--text-main)]">{result.report.summary}</p>
              <ReportSections report={result.report} />
            </MysticCard>
          )}
        </motion.div>
      )}
    </AppShell>
  );
}
