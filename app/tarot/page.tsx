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
import { buildFortuneSuccess } from "@/lib/client/fortuneResponse";
import { drawTarotReading } from "@/lib/fortune/tarot";
import { generateTarotReport } from "@/lib/fortune/report/tarotReport";
import { toErrorResponse } from "@/lib/fortune/shared/errors";
import { tarotInputSchema } from "@/lib/fortune/shared/validation";
import { saveReport } from "@/lib/storage/localReports";
import { cn } from "@/lib/utils";
import type { CalculationStep } from "@/lib/fortune/shared/types";
import type { FortuneReport } from "@/lib/fortune/shared/reportTypes";

const SPREADS = [
  { id: "single", label: "单张牌" },
  { id: "threeCard", label: "三张牌阵" },
  { id: "love", label: "感情牌阵" },
  { id: "career", label: "事业牌阵" },
  { id: "yesNo", label: "是/否牌阵" },
] as const;

export default function TarotPage() {
  const [loading, setLoading] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [spread, setSpread] = useState("threeCard");
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
    await new Promise((r) => setTimeout(r, 600));
    setShuffling(false);

    const fd = new FormData(e.currentTarget);
    try {
      const input = tarotInputSchema.parse({
        question: (fd.get("question") as string) || undefined,
        spread: fd.get("spread"),
      });
      const { result: algoResult, steps } = drawTarotReading(
        input.spread,
        input.question,
        input.seed,
      );
      const report = generateTarotReport(algoResult, input.question);
      const data = buildFortuneSuccess("tarot", input, algoResult, steps, report);

      setResult(data);
      saveReport("tarot", data);
    } catch (err) {
      setError(toErrorResponse(err).error.message);
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
        className="mb-4 md:mb-0"
      />

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-8 md:gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
        <MysticCard title="开启牌阵" description="静心默念你的问题">
          <form onSubmit={onSubmit} className="space-y-4">
            <FormFieldShell label="问题（可选）" htmlFor="question">
              <textarea
                id="question"
                name="question"
                rows={3}
                placeholder="你想问什么？"
                className="mystic-input min-h-[88px] w-full rounded-lg px-3 py-2 text-base sm:text-sm"
              />
            </FormFieldShell>
            <FormFieldShell label="牌阵" htmlFor="spread">
              <input type="hidden" name="spread" value={spread} />
              <div className="grid grid-cols-2 gap-2">
                {SPREADS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSpread(s.id)}
                    className={cn(
                      "min-h-[44px] rounded-xl border px-2 py-2 text-xs transition-colors sm:text-sm",
                      spread === s.id
                        ? "border-[var(--gold-main)]/50 bg-[rgba(139,92,246,0.12)] text-[var(--gold-main)]"
                        : "border-[var(--border-soft)] text-[var(--text-muted)]",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </FormFieldShell>
            <MysticButton type="submit" variant="primary" loading={loading} className="w-full">
              {shuffling ? "洗牌中…" : loading ? "抽牌中…" : "开始抽牌"}
            </MysticButton>
          </form>
        </MysticCard>

        <div className="min-w-0">
          {error && (
            <p className="mb-4 rounded-lg border border-[var(--danger)]/30 bg-[rgba(224,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </p>
          )}
          {shuffling && (
            <div className="flex justify-center gap-3 py-8">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.12 }}
                >
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
            <MysticCard className="flex min-h-[200px] items-center justify-center sm:min-h-[280px]">
              <p className="text-sm text-[var(--text-dim)]">选择牌阵并抽牌后，解读将在此呈现</p>
            </MysticCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
