"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { SectionTitle } from "@/components/ui/section-title";
import { MysticCard } from "@/components/ui/mystic-card";
import { MysticButton } from "@/components/ui/mystic-button";
import { FormFieldShell } from "@/components/ui/form-field-shell";
import { PillBadge } from "@/components/ui/pill-badge";
import type { FortuneReport } from "@/lib/fortune/shared/reportTypes";

function PersonFields({ prefix, label }: { prefix: string; label: string }) {
  return (
    <MysticCard title={label}>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormFieldShell label="出生日期" htmlFor={`${prefix}_birthDate`}>
          <input id={`${prefix}_birthDate`} name={`${prefix}_birthDate`} type="date" required defaultValue="1990-05-15" className="mystic-input h-10 w-full rounded-lg px-3 text-sm" />
        </FormFieldShell>
        <FormFieldShell label="出生时间" htmlFor={`${prefix}_birthTime`}>
          <input id={`${prefix}_birthTime`} name={`${prefix}_birthTime`} type="time" required defaultValue="10:00" className="mystic-input h-10 w-full rounded-lg px-3 text-sm" />
        </FormFieldShell>
        <FormFieldShell label="性别" htmlFor={`${prefix}_gender`}>
          <select id={`${prefix}_gender`} name={`${prefix}_gender`} defaultValue="unknown" className="mystic-input h-10 w-full rounded-lg px-3 text-sm">
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="unknown">未说明</option>
          </select>
        </FormFieldShell>
        <FormFieldShell label="时区" htmlFor={`${prefix}_timezone`}>
          <input id={`${prefix}_timezone`} name={`${prefix}_timezone`} defaultValue="Asia/Shanghai" className="mystic-input h-10 w-full rounded-lg px-3 text-sm" />
        </FormFieldShell>
      </div>
    </MysticCard>
  );
}

export default function LovePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    algorithm_result: Record<string, unknown>;
    report: FortuneReport;
  } | null>(null);

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

  const algo = result?.algorithm_result;
  const score = algo?.matchScore as number | undefined;

  return (
    <AppShell>
      <SectionTitle eyebrow="情感合盘" title="双人合盘" subtitle="八字五行互补 · 相处倾向分析 · 不作绝对论断" />

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <PersonFields prefix="a" label="甲方命盘" />
          <PersonFields prefix="b" label="乙方命盘" />
        </div>
        <MysticButton type="submit" loading={loading} variant="primary">
          开始合盘
        </MysticButton>
      </form>

      {algo && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 space-y-6">
          <MysticCard highlighted className="text-center">
            <p className="text-xs text-[var(--text-dim)]">匹配度</p>
            <p className="font-display text-5xl font-bold text-[var(--gold-main)]">{score}</p>
            <p className="text-sm text-[var(--text-muted)]">/ 100</p>
            <div
              className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--purple-deep)] to-[var(--gold-main)]"
                style={{ width: `${score ?? 0}%` }}
              />
            </div>
          </MysticCard>

          <div className="grid gap-4 md:grid-cols-2">
            <MysticCard title="吸引力">
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                {(algo.attractionPoints as string[])?.map((p, i) => (
                  <li key={i}>· {p}</li>
                ))}
              </ul>
            </MysticCard>
            <MysticCard title="摩擦点">
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                {(algo.conflictPoints as string[])?.map((p, i) => (
                  <li key={i}>· {p}</li>
                ))}
              </ul>
            </MysticCard>
          </div>

          <MysticCard title="五行互补">
            <div className="flex flex-wrap gap-2">
              {(algo.complementaryElements as string[])?.map((el) => (
                <PillBadge key={el} variant="gold">{el}</PillBadge>
              ))}
            </div>
          </MysticCard>

          {result?.report && (
            <MysticCard title="合盘报告">
              <p className="text-sm text-[var(--text-main)]">{result.report.summary}</p>
              {result.report.sections.map((s) => (
                <div key={s.title} className="mt-4">
                  <h4 className="text-sm text-[var(--gold-main)]">{s.title}</h4>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{s.content}</p>
                </div>
              ))}
            </MysticCard>
          )}
        </motion.div>
      )}
    </AppShell>
  );
}
