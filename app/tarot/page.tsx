"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { SectionTitle } from "@/components/ui/section-title";
import { MysticCard } from "@/components/ui/mystic-card";
import { MysticButton } from "@/components/ui/mystic-button";
import { TarotCardUI } from "@/components/tarot/TarotCard";
import { TarotQuestionForm } from "@/components/tarot/TarotQuestionForm";
import { TarotReadingResult } from "@/components/tarot/TarotReadingResult";
import { generateTarotReport } from "@/lib/fortune/report/tarotReport";
import {
  buildTarotCalculationSteps,
  generateTarotReading,
  type TarotFocusArea,
  type TarotReading,
} from "@/lib/fortune/tarot";
import { saveReport } from "@/lib/storage/localReports";

export default function TarotPage() {
  const [question, setQuestion] = useState("");
  const [spreadId, setSpreadId] = useState("single");
  const [focusArea, setFocusArea] = useState<TarotFocusArea>("overall");
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<TarotReading | null>(null);

  const handleDraw = useCallback(() => {
    setError(null);
    setIsDrawing(true);

    globalThis.setTimeout(() => {
      try {
        const result = generateTarotReading({
          question,
          spreadId,
          focusArea,
        });

        if (!result || !result.cards || result.cards.length === 0) {
          throw new Error("未能生成塔罗牌结果");
        }

        const report = generateTarotReport(result);
        const steps = buildTarotCalculationSteps(result);
        setReading(result);
        saveReport("tarot", {
          report,
          input: { question, spreadId, focusArea },
          algorithm_result: result,
          calculation_steps: steps,
          warnings: [],
        });
      } catch (err) {
        console.error("Tarot draw failed:", err);
        setError(err instanceof Error ? err.message : "抽牌失败，请稍后重试");
      } finally {
        setIsDrawing(false);
      }
    }, 180);
  }, [focusArea, question, spreadId]);

  const steps = reading ? buildTarotCalculationSteps(reading) : [];

  return (
    <AppShell>
      <SectionTitle
        eyebrow="塔罗指引"
        title="塔罗抽牌"
        subtitle="完整 78 张牌库 · 正逆位 · 本地规则解读"
        className="mb-4 md:mb-0"
      />

      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-8 md:gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
        <MysticCard title="开启牌阵" description="静心默念你的问题">
          <TarotQuestionForm
            question={question}
            spreadId={spreadId}
            focusArea={focusArea}
            isDrawing={isDrawing}
            hasReading={!!reading}
            onQuestionChange={setQuestion}
            onSpreadChange={setSpreadId}
            onFocusAreaChange={setFocusArea}
            onSubmit={handleDraw}
          />
        </MysticCard>

        <div className="min-w-0">
          {error && (
            <MysticCard title="抽牌失败" description="请检查提示后重新尝试" className="mb-4">
              <p className="rounded-lg border border-[var(--danger)]/30 bg-[rgba(224,107,107,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
                {error}
              </p>
              <MysticButton type="button" variant="secondary" className="mt-4 w-full" onClick={handleDraw}>
                重新尝试
              </MysticButton>
            </MysticCard>
          )}

          {isDrawing && (
            <MysticCard className="mb-4">
              <p className="mb-5 text-center text-sm text-[var(--text-muted)]">正在洗牌...</p>
              <div className="flex justify-center gap-3 py-2">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 0.7, delay: index * 0.12 }}
                    className="w-24 sm:w-28"
                  >
                    <TarotCardUI revealed={false} />
                  </motion.div>
                ))}
              </div>
            </MysticCard>
          )}

          {reading && !isDrawing && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <TarotReadingResult reading={reading} steps={steps} />
            </motion.div>
          )}

          {!reading && !isDrawing && !error && (
            <MysticCard className="flex min-h-[220px] items-center justify-center sm:min-h-[300px]">
              <p className="px-4 text-center text-sm text-[var(--text-dim)]">
                选择牌阵并抽牌后，解读将在此呈现
              </p>
            </MysticCard>
          )}
        </div>
      </div>
    </AppShell>
  );
}
