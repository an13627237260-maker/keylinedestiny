"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  CalculationStepsPanel,
  DisclaimerBanner,
} from "@/components/fortune/calculation-steps";
import { DISCLAIMER } from "@/lib/fortune/shared/constants";

export default function TarotPage() {
  const [loading, setLoading] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShuffling(true);
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 800));
    setShuffling(false);

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/tarot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: fd.get("question"),
          spread: fd.get("spread"),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message ?? "失败");
      setResult(data);
      localStorage.setItem(`report-tarot-${Date.now()}`, JSON.stringify(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  const cards = (
    result?.algorithm_result as { cards?: Array<{ card: { nameCn: string }; upright: boolean; position: string }> }
  )?.cards;

  return (
    <PageShell>
      <h1 className="mb-6 text-2xl font-bold text-violet-200">塔罗抽牌</h1>
      <DisclaimerBanner text={DISCLAIMER} />

      <form onSubmit={onSubmit} className="mt-6 space-y-4 max-w-lg">
        <div>
          <Label>问题（可选）</Label>
          <Textarea name="question" placeholder="你想问什么？" />
        </div>
        <div>
          <Label>牌阵</Label>
          <Select name="spread" defaultValue="threeCard">
            <option value="single">单张</option>
            <option value="threeCard">三张（过去/现在/未来）</option>
            <option value="love">爱情牌阵</option>
            <option value="career">事业牌阵</option>
            <option value="yesNo">是非牌阵</option>
          </Select>
        </div>
        <Button type="submit" disabled={loading}>
          {shuffling ? "洗牌中..." : loading ? "抽牌中..." : "抽牌"}
        </Button>
      </form>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      {cards && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {cards.map((c, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>{c.position}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-violet-200">{c.card.nameCn}</p>
                <p className="text-sm text-zinc-400">{c.upright ? "正位" : "逆位"}</p>
              </CardContent>
            </Card>
          ))}
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>AI 解读</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap text-sm">
              {String(result?.ai_report ?? "")}
            </CardContent>
          </Card>
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>计算步骤</CardTitle>
            </CardHeader>
            <CardContent>
              <CalculationStepsPanel steps={(result?.calculation_steps as never[]) ?? []} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </PageShell>
  );
}
