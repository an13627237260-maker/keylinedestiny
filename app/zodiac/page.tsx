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
  generateZodiacFortune,
  getZodiacById,
  getZodiacSign,
  type FortunePeriod,
} from "@/lib/fortune/zodiac";
import { generateZodiacReport } from "@/lib/fortune/report/zodiacReport";
import { toErrorResponse } from "@/lib/fortune/shared/errors";
import { zodiacInputSchema } from "@/lib/fortune/shared/validation";
import { saveReport } from "@/lib/storage/localReports";
import type { FortuneReport } from "@/lib/fortune/shared/reportTypes";

const inputClass =
  "mystic-input min-h-[44px] w-full rounded-lg px-3 text-base sm:text-sm";

export default function ZodiacPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("daily");
  const [result, setResult] = useState<{
    algorithm_result: {
      sign: { name: string; element: string; modality: string; ruler: string; personalityKeywords: string[] };
      fortune: { summary: string; love: string; career: string; wellness: string; themes: string[] };
      period: string;
    };
    report: FortuneReport;
  } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const p = (fd.get("period") as string) || "daily";
    setPeriod(p);

    try {
      const input = zodiacInputSchema.parse({
        birthDate: fd.get("birthDate"),
        period: p,
      });
      const date = input.date ?? new Date().toISOString().slice(0, 10);

      const sign = input.zodiacSign
        ? getZodiacById(input.zodiacSign) ?? getZodiacSign(input.birthDate ?? date)
        : getZodiacSign(input.birthDate ?? date);

      const periodMap: Record<string, FortunePeriod> = {
        daily: "daily",
        weekly: "weekly",
        monthly: "monthly",
        day: "daily",
        week: "weekly",
        month: "monthly",
        year: "yearly",
      };
      const mappedPeriod = periodMap[input.period] ?? "daily";
      const fortune = generateZodiacFortune(sign, mappedPeriod, date);
      const algorithm_result = { sign, fortune, period: mappedPeriod, date };
      const report = generateZodiacReport(algorithm_result);
      const data = buildFortuneSuccess("zodiac", input, algorithm_result, [
        {
          step: "zodiac_fortune",
          title: "星座运势",
          input: { sign: sign.id, date, period: input.period },
          method: "deterministic seed = date + sign + period",
          result: { seed: fortune.seed, themes: fortune.themes },
          notes: ["娱乐型趋势解读，同一天同星座输出稳定"],
        },
      ], report);

      setResult(data);
      saveReport("zodiac", data);
    } catch (err) {
      setError(toErrorResponse(err).error.message);
    } finally {
      setLoading(false);
    }
  }

  const sign = result?.algorithm_result.sign;
  const fortune = result?.algorithm_result.fortune;

  return (
    <AppShell>
      <SectionTitle
        eyebrow="星座运势"
        title="星座分析"
        subtitle="确定性算法 · 同一天同星座结果一致"
        className="mb-4 md:mb-0"
      />

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-8 md:gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
        <MysticCard title="出生信息">
          <form onSubmit={onSubmit} className="space-y-4">
            <FormFieldShell label="生日" htmlFor="birthDate">
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                required
                defaultValue="1995-08-15"
                className={inputClass}
              />
            </FormFieldShell>
            <FormFieldShell label="周期" htmlFor="period">
              <select id="period" name="period" defaultValue="daily" className={inputClass}>
                <option value="daily">今日</option>
                <option value="weekly">本周</option>
                <option value="monthly">本月</option>
              </select>
            </FormFieldShell>
            <MysticButton type="submit" loading={loading} variant="primary" className="w-full">
              查看运势
            </MysticButton>
          </form>
        </MysticCard>

        <div className="min-w-0 space-y-4">
          {error && (
            <p className="rounded-lg border border-[var(--danger)]/30 bg-[rgba(224,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </p>
          )}
          {loading && !result && (
            <p className="text-center text-sm text-[var(--text-muted)]">正在生成运势…</p>
          )}
          {sign ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <MysticCard highlighted>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[var(--gold-main)]/40 bg-[rgba(139,92,246,0.1)] sm:h-20 sm:w-20">
                    <span className="font-display text-xl text-[var(--gold-main)] sm:text-2xl">
                      {sign.name.slice(0, 1)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display text-xl text-[var(--text-main)] sm:text-2xl">{sign.name}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <PillBadge variant="gold">{sign.element}象</PillBadge>
                      <PillBadge variant="purple">{sign.modality}</PillBadge>
                      <PillBadge variant="muted">守护 {sign.ruler}</PillBadge>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                  {sign.personalityKeywords.join(" · ")}
                </p>
              </MysticCard>

              {fortune && (
                <>
                  <MysticCard
                    title={period === "daily" ? "今日运势" : period === "weekly" ? "本周运势" : "本月运势"}
                    highlighted
                  >
                    <p className="text-sm leading-7 text-[var(--text-main)]">{fortune.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {fortune.themes?.map((t) => (
                        <PillBadge key={t} variant="purple">
                          {t}
                        </PillBadge>
                      ))}
                    </div>
                  </MysticCard>

                  <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scrollbar-none">
                    {[
                      { label: "感情", text: fortune.love },
                      { label: "事业", text: fortune.career },
                      { label: "身心", text: fortune.wellness },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="min-w-[140px] shrink-0 rounded-xl border border-[var(--border-soft)] p-3 sm:min-w-[160px]"
                      >
                        <p className="text-xs font-medium text-[var(--gold-main)]">{item.label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {result?.report && (
                <MysticCard title="运势报告">
                  <p className="mb-4 text-sm leading-7 text-[var(--text-muted)]">{result.report.summary}</p>
                  <ReportSections report={result.report} />
                </MysticCard>
              )}
            </motion.div>
          ) : (
            !loading && (
              <MysticCard className="flex min-h-[180px] items-center justify-center sm:min-h-[240px]">
                <p className="text-sm text-[var(--text-dim)]">输入生日后查看星座运势</p>
              </MysticCard>
            )
          )}
        </div>
      </div>
    </AppShell>
  );
}
