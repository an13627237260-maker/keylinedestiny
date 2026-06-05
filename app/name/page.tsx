"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import {
  CalculationStepsPanel,
  DisclaimerBanner,
} from "@/components/fortune/calculation-steps";
import { DISCLAIMER } from "@/lib/fortune/shared/constants";

export default function NamePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        script: fd.get("script"),
      }),
    });
    const data = await res.json();
    if (data.success) setResult(data);
    setLoading(false);
  }

  const algo = result?.algorithm_result as Record<string, unknown> | undefined;

  return (
    <PageShell>
      <h1 className="mb-6 text-2xl font-bold text-violet-200">姓名分析</h1>
      <DisclaimerBanner text={DISCLAIMER} />

      <form onSubmit={onSubmit} className="mt-6 flex flex-wrap gap-4 items-end">
        <div>
          <Label>姓名</Label>
          <Input name="name" required placeholder="王小明" defaultValue="王小明" />
        </div>
        <div>
          <Label>字形</Label>
          <Select name="script" defaultValue="simplified">
            <option value="simplified">简体</option>
            <option value="traditional">繁体</option>
          </Select>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "分析中..." : "分析"}
        </Button>
      </form>

      {algo && (
        <div className="mt-8 space-y-4">
          {(algo.missingChars as string[] | undefined)?.length ? (
            <Card>
              <CardContent className="pt-6 text-amber-400">
                缺少笔画数据：{(algo.missingChars as string[]).join("、")}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>五格 · 评分 {String(algo.nameScore)}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm">{JSON.stringify(algo.fiveGrid, null, 2)}</pre>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>AI 解读</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap text-sm">
              {String(result?.ai_report ?? "")}
            </CardContent>
          </Card>
          <CalculationStepsPanel steps={(result?.calculation_steps as never[]) ?? []} />
        </div>
      )}
    </PageShell>
  );
}
