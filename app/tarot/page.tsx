"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { SectionTitle } from "@/components/ui/section-title";
import { MysticCard } from "@/components/ui/mystic-card";
import { MysticButton } from "@/components/ui/mystic-button";
import { FormFieldShell } from "@/components/ui/form-field-shell";
import { TarotCardUI } from "@/components/tarot/TarotCard";
import { TarotReadingResult } from "@/components/tarot/TarotReadingResult";
import type { CalculationStep } from "@/lib/fortune/shared/types";
import type { FortuneReport } from "@/lib/fortune/shared/reportTypes";

export default function TarotPage() {
  const [loading, setLoading] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [result, setResult] = useState<{
    algorithm_result: { cards: Array<{ card: { nameCn: string }; upright: boolean; position: string }> };
    report: FortuneReport;
    calculation_steps: CalculationStep[];
  } | null>(null);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShuffling(true);
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 900));
    setShuffling(false);

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/tarot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: fd.get("question"), spread: fd.get("spread") }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message ?? "失败");
      setResult(data);
      const { saveReport } = await import("@/lib/storage/localReports");
      saveReport("tarot", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <SectionTitle
        eyebrow="塔罗指引"
        title="塔罗抽牌"
        subtitle="78 张完整牌组 · 可追溯随机种子 · 规则引擎解读"
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
        <MysticCard title="开启牌阵" description="静心默念你的问题">
          <form onSubmit={onSubmit} className="space-y-4">
            <FormFieldShell label="问题（可选）" htmlFor="question">
              <textarea
                id="question"
                name="question"
                rows={3}
                placeholder="你想问什么？"
                className="mystic-input w-full rounded-lg px-3 py-2 text-sm"
              />
            </FormFieldShell>
            <FormFieldShell label="牌阵" htmlFor="spread">
              <select id="spread" name="spread" defaultValue="threeCard" className="mystic-input h-10 w-full rounded-lg px-3 text-sm">
                <option value="single">单张牌</option>
                <option value="threeCard">三张（过去/现在/未来）</option>
                <option value="love">感情牌阵</option>
                <option value="career">事业牌阵</option>
                <option value="yesNo">是/否牌阵</option>
              </select>
            </FormFieldShell>
            <MysticButton type="submit" variant="primary" loading={loading} className="w-full">
              {shuffling ? "洗牌中…" : loading ? "抽牌中…" : "开始抽牌"}
            </MysticButton>
          </form>
        </MysticCard>

        <div>
          {error && <p className="mb-4 text-sm text-[var(--danger)]">{error}</p>}
          {shuffling && (
            <div className="flex justify-center gap-4 py-12">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}>
                  <TarotCardUI revealed={false} />
                </motion.div>
              ))}
            </div>
          )}
          {result && !shuffling && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TarotReadingResult
                cards={result.algorithm_result.cards}
                report={result.report}
                steps={result.calculation_steps}
              />
            </motion.div>
          )}
          {!result && !shuffling && (
            <MysticCard className="flex min-h-[280px] items-center justify-center">
              <p className="text-sm text-[var(--text-dim)]">选择牌阵并抽牌后，解读将在此呈现</p>
            </MysticCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
