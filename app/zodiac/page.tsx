"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { DisclaimerBanner } from "@/components/fortune/calculation-steps";
import { DISCLAIMER } from "@/lib/fortune/shared/constants";

export default function ZodiacPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/zodiac", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate: fd.get("birthDate"),
        period: fd.get("period"),
      }),
    });
    const data = await res.json();
    if (data.success) setResult(data);
    setLoading(false);
  }

  const algo = result?.algorithm_result as Record<string, unknown> | undefined;
  const sign = algo?.sign as Record<string, string> | undefined;
  const fortune = algo?.fortune as Record<string, string> | undefined;

  return (
    <PageShell>
      <h1 className="mb-6 text-2xl font-bold text-violet-200">星座分析</h1>
      <DisclaimerBanner text={DISCLAIMER} />

      <form onSubmit={onSubmit} className="mt-6 flex flex-wrap gap-4 items-end">
        <div>
          <Label>生日</Label>
          <Input name="birthDate" type="date" required defaultValue="1995-08-15" />
        </div>
        <div>
          <Label>周期</Label>
          <Select name="period" defaultValue="daily">
            <option value="daily">今日</option>
            <option value="weekly">本周</option>
            <option value="monthly">本月</option>
          </Select>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "加载中..." : "查看运势"}
        </Button>
      </form>

      {sign && (
        <div className="mt-8 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{sign.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-400">
              元素：{sign.element} · 模式：{sign.modality} · 守护星：{sign.ruler}
            </CardContent>
          </Card>
          {fortune && (
            <Card>
              <CardHeader>
                <CardTitle>趋势解读</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>{fortune.summary}</p>
                <p>{fortune.love}</p>
                <p>{fortune.career}</p>
                <p>{fortune.wellness}</p>
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
        </div>
      )}
    </PageShell>
  );
}
