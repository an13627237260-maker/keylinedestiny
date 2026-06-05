"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalculationStepsPanel } from "@/components/fortune/calculation-steps";
import { FiveElementsChart } from "@/components/bazi/five-elements-chart";
import { BRANCH_HIDDEN_STEMS } from "@/lib/fortune/bazi/hiddenStems";
import {
  labelFocusArea,
  labelLuckDirection,
  labelPillar,
  labelStrength,
} from "@/lib/fortune/shared/labels";
import type { CalculationStep } from "@/lib/fortune/shared/types";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";
import type { AiStatusPayload } from "@/lib/fortune/shared/types";
import { getAiStatusDisplayLabel } from "@/lib/ai/types";

const PILLAR_KEYS = ["year", "month", "day", "hour"] as const;

function AiStatusBadge({ status }: { status?: AiStatusPayload }) {
  if (!status) return null;
  const label = status.display_label || getAiStatusDisplayLabel(status);
  const isOpenAI = status.provider === "openai" && status.consistency_passed;
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        isOpenAI
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
          : "border-amber-500/40 bg-amber-500/10 text-amber-200"
      }`}
    >
      <p className="font-medium">{label}</p>
      <p className="mt-1 text-xs opacity-80">{status.reason}</p>
      {status.model && (
        <p className="mt-1 text-xs text-zinc-500">模型：{status.model}</p>
      )}
    </div>
  );
}

function RelationsBlock({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-medium text-violet-200">{title}</h4>
      {items.length ? (
        <ul className="list-disc space-y-1 pl-4 text-sm text-zinc-400">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">{emptyText}</p>
      )}
    </div>
  );
}

export function BaziResultPanels({
  algo,
  aiReport,
  aiStatus,
  calculationSteps,
  focusArea,
}: {
  algo: BaziAlgorithmResult;
  aiReport: string;
  aiStatus?: AiStatusPayload;
  calculationSteps: CalculationStep[];
  focusArea?: string;
}) {
  const [reportOpen, setReportOpen] = useState(true);

  const stemRelations = [
    ...algo.stemRelations.combinations.map(
      (c) => `天干五合 ${c.stems.join("")} → ${c.result}（${c.pillars.join("·")}）`,
    ),
    ...algo.stemRelations.clashes.map(
      (c) => `天干相冲 ${c.stems.join("")}（${c.pillars.join("·")}）`,
    ),
  ];

  const branchItems = [
    ...algo.branchRelations.combinations.map(
      (c) => `六合 ${c.branches.join("")} ${c.description}`,
    ),
    ...algo.branchRelations.meetings.map((m) => m.description),
    ...algo.branchRelations.clashes.map(
      (c) => `六冲 ${c.branches.join("")}`,
    ),
    ...algo.branchRelations.harms.map((h) => `六害 ${h.branches.join("")}`),
    ...algo.branchRelations.punishments.map((p) => p.description),
  ];

  return (
    <div className="space-y-6">
      {/* 四柱命盘 */}
      <Card>
        <CardHeader>
          <CardTitle>四柱命盘</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PILLAR_KEYS.map((key) => {
            const pillar = algo.pillars[key];
            const pillarStr = algo.pillarStrings[key];
            const stemGod = algo.tenGods.pillarStemGods[key];
            const hidden = BRANCH_HIDDEN_STEMS[pillar.branch] ?? [];
            const hiddenGods = hidden.map((stem) => {
              const entry = algo.tenGods.hiddenStemGods.find(
                (h) => h.branch === pillar.branch && h.stem === stem,
              );
              return `${stem}${entry ? `（${entry.god}）` : ""}`;
            });

            return (
              <div
                key={key}
                className="rounded-xl border border-violet-500/20 bg-zinc-950/50 p-4"
              >
                <p className="text-xs text-zinc-500">{labelPillar(key)}</p>
                <p className="mt-1 text-2xl font-bold text-violet-100">
                  {pillarStr}
                </p>
                <div className="mt-3 space-y-1 text-sm text-zinc-400">
                  <p>
                    天干：{pillar.stem}
                    <span className="text-violet-300">（{stemGod}）</span>
                  </p>
                  <p>地支：{pillar.branch}</p>
                  <p>藏干：{hiddenGods.join("、") || "—"}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 五行 */}
      <Card>
        <CardHeader>
          <CardTitle>五行分布</CardTitle>
        </CardHeader>
        <CardContent>
          <FiveElementsChart
            percentages={algo.fiveElements.percentages}
            strongestElement={algo.fiveElements.strongestElement}
            weakestElement={algo.fiveElements.weakestElement}
            balanceScore={algo.fiveElements.balanceScore}
          />
        </CardContent>
      </Card>

      {/* 日主强弱 */}
      <Card>
        <CardHeader>
          <CardTitle>日主强弱</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            日主：
            <span className="text-violet-200">
              {algo.dayMasterStrength.dayMaster}
              （{algo.dayMasterStrength.dayMasterElement}）
            </span>
          </p>
          <p>
            强弱：
            <span className="font-medium text-amber-200">
              {labelStrength(algo.dayMasterStrength.strengthLevel)}
            </span>
            <span className="ml-2 text-zinc-500">
              评分 {algo.dayMasterStrength.strengthScore}
            </span>
          </p>
          <div>
            <p className="mb-1 text-zinc-500">支持因素</p>
            <ul className="list-disc pl-4 text-zinc-400">
              {algo.dayMasterStrength.supportFactors.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-zinc-500">消耗因素</p>
            <ul className="list-disc pl-4 text-zinc-400">
              {algo.dayMasterStrength.weakeningFactors.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 十神 */}
      <Card>
        <CardHeader>
          <CardTitle>十神分析</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            {Object.entries(algo.tenGods.counts)
              .filter(([, v]) => v > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([god, count]) => (
                <span
                  key={god}
                  className="rounded-full border border-violet-500/30 px-3 py-1 text-zinc-300"
                >
                  {god} {typeof count === "number" ? count.toFixed(1) : count}
                </span>
              ))}
          </div>
          <p className="text-zinc-400">
            主要十神倾向：
            <span className="text-violet-200">
              {algo.tenGods.dominantTendency.join("、")}
            </span>
          </p>
          <p className="leading-relaxed text-zinc-500">
            天干十神分别落在四柱之上，藏干十神则反映地支内部的隐藏力量。倾向越明显的十神，越容易在性格与{labelFocusArea(focusArea)}选择上显现相关主题。
          </p>
        </CardContent>
      </Card>

      {/* 合冲刑害 */}
      <Card>
        <CardHeader>
          <CardTitle>合冲刑害</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <RelationsBlock
            title="天干关系"
            items={stemRelations}
            emptyText="未见明显天干合冲"
          />
          <RelationsBlock
            title="地支关系"
            items={branchItems}
            emptyText="当前命局中明显冲合较少，整体结构相对平稳"
          />
        </CardContent>
      </Card>

      {/* 大运 */}
      <Card>
        <CardHeader>
          <CardTitle>大运</CardTitle>
        </CardHeader>
        <CardContent>
          {algo.luckCycle.cycles.length === 0 ? (
            <p className="text-sm text-zinc-500">
              未计算大运（请填写性别）。{algo.luckCycle.warnings.join(" ")}
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-zinc-400">
                方向：{labelLuckDirection(algo.luckCycle.direction)} · 起运约{" "}
                {algo.luckCycle.startAge} 岁
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-violet-500/20 text-zinc-500">
                      <th className="py-2 pr-4">步数</th>
                      <th className="py-2 pr-4">大运</th>
                      <th className="py-2 pr-4">十神</th>
                      <th className="py-2 pr-4">年龄</th>
                      <th className="py-2">年份</th>
                    </tr>
                  </thead>
                  <tbody>
                    {algo.luckCycle.cycles.map((c) => (
                      <tr
                        key={c.index}
                        className="border-b border-zinc-800 text-zinc-300"
                      >
                        <td className="py-2 pr-4">{c.index}</td>
                        <td className="py-2 pr-4 font-medium text-violet-200">
                          {c.pillar.stem}
                          {c.pillar.branch}
                        </td>
                        <td className="py-2 pr-4">{c.stemTenGod}</td>
                        <td className="py-2 pr-4">
                          {c.startAge}-{c.endAge}岁
                        </td>
                        <td className="py-2">
                          {c.startYear}-{c.endYear}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 流年 */}
      <Card>
        <CardHeader>
          <CardTitle>流年</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-400">
          {algo.yearlyLuck ? (
            <>
              <p>
                目标年：
                <span className="text-violet-200">
                  {algo.yearlyLuck.targetYear}
                </span>
              </p>
              <p>
                流年干支：
                <span className="text-violet-200">
                  {algo.yearlyLuck.yearPillar}
                </span>
                （十神 {algo.yearlyLuck.yearStemTenGod}）
              </p>
              <p>{Object.values(algo.yearlyLuck.focusAreaHints)[0]}</p>
              {algo.yearlyLuck.relationWithLuckCycle.map((r, i) => (
                <p key={i}>{r}</p>
              ))}
            </>
          ) : (
            <p>未指定流年。填写“流年”年份后可查看该年趋势。</p>
          )}
        </CardContent>
      </Card>

      {/* 报告 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>命理报告</CardTitle>
          <button
            type="button"
            onClick={() => setReportOpen((v) => !v)}
            className="text-xs text-violet-300 hover:text-violet-100"
          >
            {reportOpen ? "收起" : "展开"}
          </button>
        </CardHeader>
        {reportOpen && (
          <CardContent className="space-y-4">
            <AiStatusBadge status={aiStatus} />
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {aiReport}
            </div>
          </CardContent>
        )}
      </Card>

      {/* 计算步骤 */}
      <Card>
        <CardHeader>
          <CardTitle>计算步骤（可复核）</CardTitle>
        </CardHeader>
        <CardContent>
          <CalculationStepsPanel steps={calculationSteps} />
        </CardContent>
      </Card>
    </div>
  );
}
