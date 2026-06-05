"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { SectionTitle } from "@/components/ui/section-title";
import { MysticCard } from "@/components/ui/mystic-card";
import { MysticButton } from "@/components/ui/mystic-button";
import { FormFieldShell } from "@/components/ui/form-field-shell";
import { PillBadge } from "@/components/ui/pill-badge";
import { MobileMetricGrid } from "@/components/ui/MobileMetricGrid";
import { ReportSections } from "@/components/ui/ReportSections";
import { buildFortuneSuccess } from "@/lib/client/fortuneResponse";
import { analyzeName } from "@/lib/fortune/name";
import type { CustomStrokeEntry } from "@/lib/fortune/name";
import { generateNameReport } from "@/lib/fortune/report/nameReport";
import { toErrorResponse } from "@/lib/fortune/shared/errors";
import { nameInputSchema } from "@/lib/fortune/shared/validation";
import { saveReport } from "@/lib/storage/localReports";
import type { FortuneReport } from "@/lib/fortune/shared/reportTypes";

const inputClass =
  "mystic-input min-h-[44px] w-full rounded-lg px-3 text-base sm:text-sm";

export default function NamePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [script, setScript] = useState<"simplified" | "traditional">("simplified");
  const [strokeInputs, setStrokeInputs] = useState<Record<string, { simplified: string; traditional: string }>>({});
  const [result, setResult] = useState<{
    algorithm_result: Record<string, unknown>;
    report: FortuneReport;
  } | null>(null);

  function buildCustomMap(): Record<string, CustomStrokeEntry> | undefined {
    const map: Record<string, CustomStrokeEntry> = {};
    for (const [char, v] of Object.entries(strokeInputs)) {
      const s = v.simplified ? Number(v.simplified) : undefined;
      const t = v.traditional ? Number(v.traditional) : undefined;
      if (s || t) map[char] = { simplified: s, traditional: t };
    }
    return Object.keys(map).length > 0 ? map : undefined;
  }

  async function runAnalysis(
    fullName: string,
    mode: "simplified" | "traditional",
    customMap?: Record<string, CustomStrokeEntry>,
  ) {
    const { analysis, calculation_steps, warnings } = analyzeName(fullName, mode, customMap);
    const algorithm_result =
      analysis.status === "success"
        ? {
            ...analysis.result,
            fiveGrid: analysis.result.fiveGrid,
            threeTalent: analysis.result.threeTalent,
          }
        : {
            missingChars:
              analysis.status === "needs_strokes" ? analysis.missingChars : [],
            status: analysis.status,
            partialResult:
              analysis.status === "needs_strokes" ? analysis.partialResult : undefined,
          };
    const report = generateNameReport(
      algorithm_result as unknown as Parameters<typeof generateNameReport>[0],
    );
    return buildFortuneSuccess(
      "name",
      { name: fullName, script: mode },
      algorithm_result,
      calculation_steps,
      report,
      [],
      warnings,
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);

    try {
      const input = nameInputSchema.parse({
        name: fd.get("name"),
        script: fd.get("script"),
      });
      setName(input.name);
      setScript(input.script as "simplified" | "traditional");
      const data = await runAnalysis(input.name, input.script as "simplified" | "traditional");
      setResult(data);
      if ((data.algorithm_result as { status?: string }).status !== "needs_strokes") {
        saveReport("name", data);
      }
    } catch (err) {
      setError(toErrorResponse(err).error.message);
    } finally {
      setLoading(false);
    }
  }

  async function onSaveStrokes() {
    if (!name) return;
    setLoading(true);
    setError("");
    try {
      const data = await runAnalysis(name, script, buildCustomMap());
      setResult(data);
      if ((data.algorithm_result as { status?: string }).status !== "needs_strokes") {
        saveReport("name", data);
      }
    } catch (err) {
      setError(toErrorResponse(err).error.message);
    } finally {
      setLoading(false);
    }
  }

  const fg = result?.algorithm_result?.fiveGrid as Record<string, number> | undefined;
  const tt = result?.algorithm_result?.threeTalent as { config: string; tian: string; ren: string; di: string } | undefined;
  const missing = (result?.algorithm_result?.missingChars as string[]) ?? [];

  return (
    <AppShell>
      <SectionTitle
        eyebrow="姓名学"
        title="姓名分析"
        subtitle="五格剖象法简化模型 · 流派众多仅供参考"
        className="mb-4 md:mb-0"
      />

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-8 md:gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
        <MysticCard title="姓名输入">
          <form onSubmit={onSubmit} className="space-y-4">
            <FormFieldShell label="姓名" htmlFor="name">
              <input
                id="name"
                name="name"
                required
                placeholder="如：王小明"
                className={inputClass}
              />
            </FormFieldShell>
            <FormFieldShell label="字形" htmlFor="script">
              <select id="script" name="script" defaultValue="simplified" className={inputClass}>
                <option value="simplified">简体</option>
                <option value="traditional">繁体</option>
              </select>
            </FormFieldShell>
            <MysticButton type="submit" loading={loading} variant="primary" className="w-full">
              开始分析
            </MysticButton>
          </form>
        </MysticCard>

        <div className="min-w-0 space-y-4">
          {error && (
            <p className="rounded-lg border border-[var(--danger)]/30 bg-[rgba(224,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </p>
          )}
          {result ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {missing.length > 0 && (
                <MysticCard title="补充缺字笔画">
                  <p className="mb-4 text-sm text-[var(--text-muted)]">
                    以下字符缺少笔画数据，请填写后继续分析：
                  </p>
                  <div className="space-y-3">
                    {missing.map((char) => (
                      <div
                        key={char}
                        className="rounded-xl border border-[var(--border-soft)] p-3"
                      >
                        <p className="mb-3 font-display text-2xl text-[var(--gold-main)]">{char}</p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <FormFieldShell label="简体笔画" htmlFor={`s-${char}`}>
                            <input
                              id={`s-${char}`}
                              type="number"
                              min={1}
                              max={50}
                              className={inputClass}
                              value={strokeInputs[char]?.simplified ?? ""}
                              onChange={(e) =>
                                setStrokeInputs((prev) => ({
                                  ...prev,
                                  [char]: { ...prev[char], simplified: e.target.value, traditional: prev[char]?.traditional ?? "" },
                                }))
                              }
                            />
                          </FormFieldShell>
                          <FormFieldShell label="繁体笔画" htmlFor={`t-${char}`}>
                            <input
                              id={`t-${char}`}
                              type="number"
                              min={1}
                              max={50}
                              className={inputClass}
                              value={strokeInputs[char]?.traditional ?? ""}
                              onChange={(e) =>
                                setStrokeInputs((prev) => ({
                                  ...prev,
                                  [char]: { simplified: prev[char]?.simplified ?? "", traditional: e.target.value },
                                }))
                              }
                            />
                          </FormFieldShell>
                        </div>
                      </div>
                    ))}
                  </div>
                  <MysticButton
                    type="button"
                    variant="primary"
                    loading={loading}
                    className="mt-4 w-full"
                    onClick={onSaveStrokes}
                  >
                    保存并继续分析
                  </MysticButton>
                </MysticCard>
              )}

              {fg && (
                <MysticCard title="五格剖象" highlighted>
                  <MobileMetricGrid
                    items={[
                      { k: "天格", v: fg.tianGe },
                      { k: "人格", v: fg.renGe },
                      { k: "地格", v: fg.diGe },
                      { k: "外格", v: fg.waiGe },
                      { k: "总格", v: fg.zongGe },
                    ].map((g) => ({ label: g.k, value: g.v }))}
                    columns={2}
                  />
                  {tt && (
                    <div className="mt-4 rounded-xl border border-[var(--border-soft)] px-3 py-3 text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        <PillBadge variant="gold">{tt.tian}</PillBadge>
                        <PillBadge variant="purple">{tt.ren}</PillBadge>
                        <PillBadge variant="muted">{tt.di}</PillBadge>
                      </div>
                      <p className="mt-2 text-sm text-[var(--text-muted)]">
                        三才配置 <PillBadge variant="gold" className="ml-1">{tt.config}</PillBadge>
                      </p>
                    </div>
                  )}
                </MysticCard>
              )}

              <MysticCard title="姓名报告">
                <p className="mb-4 text-sm leading-7 text-[var(--text-muted)]">{result.report.summary}</p>
                <ReportSections report={result.report} />
              </MysticCard>
            </motion.div>
          ) : (
            <MysticCard className="flex min-h-[180px] items-center justify-center sm:min-h-[240px]">
              <p className="text-sm text-[var(--text-dim)]">输入姓名后生成五格分析</p>
            </MysticCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
