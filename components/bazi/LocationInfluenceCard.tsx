"use client";

import { MapPin } from "lucide-react";
import { MysticCard } from "@/components/ui/mystic-card";
import { PillBadge } from "@/components/ui/pill-badge";
import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";

export function LocationInfluenceCard({ algo }: { algo: BaziAlgorithmResult }) {
  const loc = algo.locationInfluence;
  if (!loc) return null;

  const { resolved } = loc;

  return (
    <MysticCard title="出生地与真太阳时" icon={MapPin}>
      <p className="mb-4 text-xs text-[var(--text-dim)]">
        出生地主要用于真太阳时校正，地域五行只作为气候环境辅助参考，不直接决定命盘。
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-[var(--text-dim)]">出生地</p>
          <p className="font-display text-sm text-[var(--text-main)]">
            {resolved.displayName}
          </p>
          {resolved.birthPlaceNote && (
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              备注：{resolved.birthPlaceNote}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs text-[var(--text-dim)]">经纬度</p>
          <p className="text-sm text-[var(--text-muted)]">
            {resolved.longitude !== undefined
              ? `${resolved.longitude.toFixed(4)}°E`
              : "—"}
            {resolved.latitude !== undefined
              ? ` · ${resolved.latitude.toFixed(4)}°N`
              : ""}
          </p>
          <PillBadge variant="muted" className="mt-1">
            {resolved.locationConfidence === "exact_city"
              ? "城市精确"
              : resolved.locationConfidence === "province_capital"
                ? "省会近似"
                : resolved.locationConfidence === "manual"
                  ? "手动坐标"
                  : resolved.locationConfidence === "online_verified"
                    ? "联网校准"
                    : "未确定"}
          </PillBadge>
          {resolved.dataSource && (
            <p className="mt-1 text-xs text-[var(--text-dim)]">
              来源：{resolved.dataSource.providerName}
              {resolved.dataSource.fromCache ? "（缓存）" : ""}
            </p>
          )}
        </div>
      </div>

      {loc.useTrueSolarTime && loc.correctionMinutes !== undefined && (
        <div className="mt-4 rounded-xl border border-[var(--border-soft)] p-3 text-sm">
          <p className="text-[var(--text-muted)]">
            真太阳时修正约{" "}
            <span className="text-[var(--gold-main)]">
              {loc.correctionMinutes > 0 ? "+" : ""}
              {Math.round(loc.correctionMinutes)} 分钟
            </span>
            （标准经度 {loc.standardLongitude ?? 120}°E）
          </p>
          <p className="mt-2 text-xs text-[var(--text-dim)]">
            原始时间：{loc.originalDateTime.slice(0, 16).replace("T", " ")}
          </p>
          <p className="text-xs text-[var(--text-dim)]">
            修正后：{loc.adjustedDateTime.slice(0, 16).replace("T", " ")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <PillBadge variant={loc.hourPillarChanged ? "gold" : "muted"}>
              时柱{loc.hourPillarChanged ? "已变化" : "未变化"}
            </PillBadge>
            <PillBadge variant={loc.dayPillarChanged ? "gold" : "muted"}>
              日柱{loc.dayPillarChanged ? "已变化" : "未变化"}
            </PillBadge>
          </div>
          {loc.pillarsBeforeCorrection && loc.hourPillarChanged && (
            <p className="mt-2 text-xs text-[var(--text-dim)]">
              修正前时柱 {loc.pillarsBeforeCorrection.hour} → 修正后{" "}
              {algo.pillarStrings.hour}
            </p>
          )}
        </div>
      )}

      {!loc.useTrueSolarTime && (
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          未启用真太阳时修正，四柱按输入的北京时间（或所选时区）计算。
        </p>
      )}

      {resolved.climateTags.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-[var(--text-dim)]">气候标签</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {resolved.climateTags.map((t) => (
              <PillBadge key={t} variant="purple">
                {t}
              </PillBadge>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-muted)]">
        {loc.regionElementNote}
      </p>
    </MysticCard>
  );
}
