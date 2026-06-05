"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { SectionTitle } from "@/components/ui/section-title";
import { MysticCard } from "@/components/ui/mystic-card";
import { MysticButton } from "@/components/ui/mystic-button";
import { FormFieldShell } from "@/components/ui/form-field-shell";
import { PillBadge } from "@/components/ui/pill-badge";
import { buildFortuneSuccess } from "@/lib/client/fortuneResponse";
import { analyzeName } from "@/lib/fortune/name";
import { generateNameReport } from "@/lib/fortune/report/nameReport";
import { toErrorResponse } from "@/lib/fortune/shared/errors";
import { nameInputSchema } from "@/lib/fortune/shared/validation";
import { saveReport } from "@/lib/storage/localReports";
import type { FortuneReport } from "@/lib/fortune/shared/reportTypes";

export default function NamePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    algorithm_result: Record<string, unknown>;
    report: FortuneReport;
  } | null>(null);

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
      const { algorithm_result, calculation_steps, warnings } = analyzeName(
        input.name,
        input.script,
      );
      const report = generateNameReport(
        algorithm_result as unknown as Parameters<typeof generateNameReport>[0],
      );
      const data = buildFortuneSuccess(
        "name",
        input,
        algorithm_result,
        calculation_steps,
        report,
        [],
        warnings,
      );

      setResult(data);
      saveReport("name", data);
    } catch (err) {
      setError(toErrorResponse(err).error.message);
    } finally {
      setLoading(false);
    }
  }

  const fg = result?.algorithm_result?.fiveGrid as Record<string, number> | undefined;
  const tt = result?.algorithm_result?.threeTalent as { config: string } | undefined;

  return (
    <AppShell>
      <SectionTitle eyebrow="姓名学" title="姓名分析" subtitle="五格剖象法简化模型 · 流派众多仅供参考" />

      <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        <MysticCard title="姓名输入">
          <form onSubmit={onSubmit} className="space-y-4">
            <FormFieldShell label="姓名" htmlFor="name">
              <input id="name" name="name" required placeholder="如：王小明" className="mystic-input h-10 w-full rounded-lg px-3 text-sm" />
            </FormFieldShell>
            <FormFieldShell label="字形" htmlFor="script">
              <select id="script" name="script" defaultValue="simplified" className="mystic-input h-10 w-full rounded-lg px-3 text-sm">
                <option value="simplified">简体</option>
                <option value="traditional">繁体</option>
              </select>
            </FormFieldShell>
            <MysticButton type="submit" loading={loading} variant="primary">
              开始分析
            </MysticButton>
          </form>
        </MysticCard>

        <div>
          {error && <p className="mb-4 text-sm text-[var(--danger)]">{error}</p>}
          {result ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              {fg ? (
                <MysticCard title="五格剖象" highlighted>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {[
                      { k: "天格", v: fg.tianGe },
                      { k: "人格", v: fg.renGe },
                      { k: "地格", v: fg.diGe },
                      { k: "外格", v: fg.waiGe },
                      { k: "总格", v: fg.zongGe },
                    ].map((g) => (
                      <div key={g.k} className="rounded-xl border border-[var(--border-soft)] py-4">
                        <p className="text-[10px] text-[var(--text-dim)]">{g.k}</p>
                        <p className="font-display text-2xl text-[var(--gold-main)]">{g.v}</p>
                      </div>
                    ))}
                  </div>
                  {tt && (
                    <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
                      三才配置 <PillBadge variant="gold" className="ml-1">{tt.config}</PillBadge>
                    </p>
                  )}
                </MysticCard>
              ) : (
                <MysticCard>
                  <p className="text-sm text-[var(--warning)]">
                    部分字符缺少笔画数据：{(result.algorithm_result.missingChars as string[])?.join("、")}
                  </p>
                </MysticCard>
              )}
              <MysticCard title="姓名报告">
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">{result.report.summary}</p>
                {result.report.sections.map((s) => (
                  <div key={s.title} className="mt-4">
                    <h4 className="text-sm text-[var(--gold-main)]">{s.title}</h4>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{s.content}</p>
                  </div>
                ))}
              </MysticCard>
            </motion.div>
          ) : (
            <MysticCard className="flex min-h-[240px] items-center justify-center">
              <p className="text-sm text-[var(--text-dim)]">输入姓名后生成五格分析</p>
            </MysticCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
