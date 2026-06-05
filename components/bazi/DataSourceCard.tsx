"use client";

import { Database } from "lucide-react";
import { MysticCard } from "@/components/ui/mystic-card";
import { PillBadge } from "@/components/ui/pill-badge";
import type { CalculationStep } from "@/lib/fortune/shared/types";

function stepResult(
  steps: CalculationStep[],
  stepName: string,
): Record<string, unknown> | undefined {
  return steps.find((step) => step.step === stepName)?.result;
}

function text(value: unknown, defaultText = "未记录"): string {
  if (typeof value === "string" && value) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return defaultText;
}

function bool(value: unknown): boolean {
  return value === true;
}

function sourceReturnUsed(result: Record<string, unknown> | undefined): boolean {
  return bool(result?.["是否使用回退"]);
}

function SourceRow({
  label,
  source,
  provider,
  returnUsed,
  fromCache,
}: {
  label: string;
  source: string;
  provider?: string;
  returnUsed?: boolean;
  fromCache?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[var(--border-soft)] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-auto text-xs text-[var(--text-dim)]">{label}</p>
        {fromCache && <PillBadge variant="muted">缓存</PillBadge>}
        {returnUsed && <PillBadge variant="gold">已回退</PillBadge>}
      </div>
      <p className="mt-1 text-sm text-[var(--text-main)]">{source}</p>
      {provider && (
        <p className="mt-1 text-xs text-[var(--text-dim)]">{provider}</p>
      )}
    </div>
  );
}

export function DataSourceCard({ steps }: { steps: CalculationStep[] }) {
  const solar = stepResult(steps, "solar_terms");
  const location = stepResult(steps, "location_calibration");
  const timezone = stepResult(steps, "timezone_calibration");
  const trueSolar = stepResult(steps, "true_solar_time");

  return (
    <MysticCard
      title="数据来源"
      description="客观校准数据来源 · 联网失败会自动回退"
      icon={Database}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <SourceRow
          label="节气数据来源"
          source={text(solar?.dataSource, "本地近似")}
          provider={text(solar?.providerName, "")}
          fromCache={bool(solar?.fromCache)}
          returnUsed={sourceReturnUsed(solar)}
        />
        <SourceRow
          label="出生地坐标来源"
          source={text(location?.dataSource, "中国内置省市表")}
          provider={text(location?.providerName, "")}
          fromCache={bool(location?.fromCache)}
          returnUsed={sourceReturnUsed(location)}
        />
        <SourceRow
          label="时区来源"
          source={text(timezone?.dataSource, "默认 Asia/Shanghai")}
          provider={text(timezone?.providerName, "")}
          fromCache={bool(timezone?.fromCache)}
          returnUsed={sourceReturnUsed(timezone)}
        />
        <SourceRow
          label="真太阳时"
          source={
            trueSolar
              ? `已使用 · 修正 ${text(trueSolar.correctionMinutes, "0")} 分钟`
              : "未使用"
          }
          provider={
            trueSolar
              ? `标准经度 ${text(trueSolar.standardLongitude, "120")}°E`
              : "未启用或缺少经度"
          }
          returnUsed={false}
        />
      </div>
    </MysticCard>
  );
}
