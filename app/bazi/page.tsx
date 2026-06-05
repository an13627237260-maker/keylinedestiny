"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { DisclaimerBanner } from "@/components/fortune/calculation-steps";
import { BaziResultPanels } from "@/components/bazi/bazi-result-panels";
import { DISCLAIMER } from "@/lib/fortune/shared/constants";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";
import type { AiStatusPayload, CalculationStep } from "@/lib/fortune/shared/types";

export default function BaziPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    algorithm_result: BaziAlgorithmResult;
    calculation_steps: CalculationStep[];
    ai_report: string;
    ai_status?: AiStatusPayload;
    input?: { focusArea?: string };
  } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name") as string,
      gender: fd.get("gender"),
      birthDate: fd.get("birthDate"),
      birthTime: fd.get("birthTime"),
      birthPlace: fd.get("birthPlace"),
      longitude: fd.get("longitude")
        ? Number(fd.get("longitude"))
        : undefined,
      timezone: fd.get("timezone") || "Asia/Shanghai",
      useTrueSolarTime: fd.get("useTrueSolarTime") === "on",
      focusArea: fd.get("focusArea") || "overall",
      targetYear: fd.get("targetYear")
        ? Number(fd.get("targetYear"))
        : undefined,
      options: {
        dayBoundaryMode: fd.get("dayBoundaryMode") || "midnight",
      },
    };

    try {
      const res = await fetch("/api/bazi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message ?? "请求失败");
      setResult(data);
      localStorage.setItem(`report-bazi-${Date.now()}`, JSON.stringify(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <h1 className="mb-6 text-2xl font-bold text-violet-200">生辰八字测算</h1>
      <DisclaimerBanner text={DISCLAIMER} />

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <Label>姓名（可选）</Label>
          <Input name="name" placeholder="姓名" />
        </div>
        <div>
          <Label>性别</Label>
          <Select name="gender" defaultValue="unknown">
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="unknown">未说明</option>
          </Select>
        </div>
        <div>
          <Label>出生日期</Label>
          <Input name="birthDate" type="date" required defaultValue="1990-05-15" />
        </div>
        <div>
          <Label>出生时间</Label>
          <Input name="birthTime" type="time" required defaultValue="14:30" />
        </div>
        <div>
          <Label>出生地</Label>
          <Input name="birthPlace" placeholder="如：北京" />
        </div>
        <div>
          <Label>时区</Label>
          <Input name="timezone" defaultValue="Asia/Shanghai" required />
        </div>
        <div>
          <Label>经度（真太阳时）</Label>
          <Input name="longitude" type="number" step="0.01" placeholder="116.40" />
        </div>
        <div>
          <Label>关注方向</Label>
          <Select name="focusArea" defaultValue="study">
            <option value="overall">综合</option>
            <option value="love">感情</option>
            <option value="career">事业</option>
            <option value="wealth">财运</option>
            <option value="study">学业</option>
            <option value="health">健康</option>
          </Select>
        </div>
        <div>
          <Label>流年（可选）</Label>
          <Input name="targetYear" type="number" placeholder="2026" defaultValue="2026" />
        </div>
        <div>
          <Label>换日规则</Label>
          <Select name="dayBoundaryMode" defaultValue="midnight">
            <option value="midnight">午夜换日</option>
            <option value="ziHour">子时初换日(23:00)</option>
          </Select>
        </div>
        <div className="flex items-center gap-2 md:col-span-2">
          <input type="checkbox" name="useTrueSolarTime" id="tst" />
          <Label htmlFor="tst">使用真太阳时</Label>
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "计算中..." : "开始测算"}
          </Button>
        </div>
      </form>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <BaziResultPanels
            algo={result.algorithm_result}
            aiReport={result.ai_report}
            aiStatus={result.ai_status}
            calculationSteps={result.calculation_steps}
            focusArea={result.input?.focusArea}
          />
        </motion.div>
      )}
    </PageShell>
  );
}
