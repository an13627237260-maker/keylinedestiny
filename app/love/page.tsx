"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { DisclaimerBanner } from "@/components/fortune/calculation-steps";
import { DISCLAIMER } from "@/lib/fortune/shared/constants";

function PersonForm({ prefix }: { prefix: string }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <Label>出生日期</Label>
        <Input name={`${prefix}_birthDate`} type="date" required defaultValue="1990-05-15" />
      </div>
      <div>
        <Label>出生时间</Label>
        <Input name={`${prefix}_birthTime`} type="time" required defaultValue="10:00" />
      </div>
      <div>
        <Label>性别</Label>
        <Select name={`${prefix}_gender`} defaultValue="unknown">
          <option value="male">男</option>
          <option value="female">女</option>
          <option value="unknown">未知</option>
        </Select>
      </div>
      <div>
        <Label>时区</Label>
        <Input name={`${prefix}_timezone`} defaultValue="Asia/Shanghai" />
      </div>
    </div>
  );
}

export default function LovePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const person = (p: string) => ({
      gender: fd.get(`${p}_gender`),
      birthDate: fd.get(`${p}_birthDate`),
      birthTime: fd.get(`${p}_birthTime`),
      timezone: fd.get(`${p}_timezone`) || "Asia/Shanghai",
      useTrueSolarTime: false,
      focusArea: "love",
    });
    const res = await fetch("/api/love", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personA: person("a"), personB: person("b") }),
    });
    const data = await res.json();
    if (data.success) setResult(data);
    setLoading(false);
  }

  const algo = result?.algorithm_result as Record<string, unknown> | undefined;

  return (
    <PageShell>
      <h1 className="mb-6 text-2xl font-bold text-violet-200">情感合盘</h1>
      <DisclaimerBanner text={DISCLAIMER} />

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>甲方</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonForm prefix="a" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>乙方</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonForm prefix="b" />
          </CardContent>
        </Card>
        <Button type="submit" disabled={loading}>
          {loading ? "分析中..." : "开始合盘"}
        </Button>
      </form>

      {algo && (
        <div className="mt-8 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>匹配度 {String(algo.matchScore)}/100</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>互补：{(algo.complementaryElements as string[])?.join("、")}</p>
              <p>吸引：{(algo.attractionPoints as string[])?.join("；")}</p>
              <p>冲突：{(algo.conflictPoints as string[])?.join("；")}</p>
            </CardContent>
          </Card>
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
