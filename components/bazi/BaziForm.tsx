"use client";

import { useMemo, useState } from "react";
import { MysticCard } from "@/components/ui/mystic-card";
import { MysticButton } from "@/components/ui/mystic-button";
import { FormFieldShell } from "@/components/ui/form-field-shell";
import { PillBadge } from "@/components/ui/pill-badge";
import {
  CHINA_PROVINCES,
  UNKNOWN_CITY,
  UNKNOWN_PROVINCE,
  getCityEntry,
} from "@/lib/fortune/location";
import { describeRegionElementBias } from "@/lib/fortune/location/regionElements";
import { cn } from "@/lib/utils";

function MysticInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "mystic-input min-h-[44px] w-full rounded-lg px-3 text-base sm:text-sm",
        props.className,
      )}
    />
  );
}

function MysticSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "mystic-input min-h-[44px] w-full rounded-lg px-3 text-base sm:text-sm",
        props.className,
      )}
    />
  );
}

const DEFAULT_PROVINCE = "北京市";
const DEFAULT_CITY = "北京市";

export function BaziForm({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [province, setProvince] = useState(DEFAULT_PROVINCE);
  const [city, setCity] = useState(DEFAULT_CITY);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [manualLon, setManualLon] = useState("");
  const [manualLat, setManualLat] = useState("");

  const isUnknown = province === UNKNOWN_PROVINCE;

  const cities = useMemo(() => {
    if (isUnknown) return [];
    const p = CHINA_PROVINCES.find((x) => x.name === province);
    return p?.cities ?? [];
  }, [province, isUnknown]);

  const cityEntry = useMemo(() => {
    if (isUnknown) return undefined;
    return getCityEntry(province, city);
  }, [province, city, isUnknown]);

  const displayLon = manualLon || cityEntry?.longitude?.toFixed(4) || "";
  const displayLat = manualLat || cityEntry?.latitude?.toFixed(4) || "";

  function onProvinceChange(next: string) {
    setProvince(next);
    if (next === UNKNOWN_PROVINCE) {
      setCity(UNKNOWN_CITY);
      setManualLon("");
      setManualLat("");
      return;
    }
    const p = CHINA_PROVINCES.find((x) => x.name === next);
    setCity(p?.cities[0]?.city ?? "");
    setManualLon("");
    setManualLat("");
  }

  return (
    <MysticCard
      title="出生信息"
      description="选择出生地以自动校准经纬度与真太阳时"
      headerAction={
        <div className="hidden flex-wrap gap-1 sm:flex">
          <PillBadge variant="purple">规则引擎</PillBadge>
          <PillBadge variant="muted">可复核</PillBadge>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="hidden" name="province" value={province} />
        <input type="hidden" name="city" value={city} />
        <input type="hidden" name="locationUnknown" value={isUnknown ? "on" : ""} />
        {manualLon && <input type="hidden" name="manualLongitude" value={manualLon} />}
        {manualLat && <input type="hidden" name="manualLatitude" value={manualLat} />}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormFieldShell label="姓名（可选）" htmlFor="name">
            <MysticInput id="name" name="name" placeholder="可选" />
          </FormFieldShell>
          <FormFieldShell label="性别" htmlFor="gender">
            <MysticSelect id="gender" name="gender" defaultValue="unknown">
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="unknown">未说明</option>
            </MysticSelect>
          </FormFieldShell>
          <FormFieldShell label="出生日期" htmlFor="birthDate">
            <MysticInput id="birthDate" name="birthDate" type="date" required />
          </FormFieldShell>
          <FormFieldShell label="出生时间" htmlFor="birthTime">
            <MysticInput id="birthTime" name="birthTime" type="time" required />
          </FormFieldShell>

          <FormFieldShell label="省级行政区" htmlFor="provinceSelect">
            <MysticSelect
              id="provinceSelect"
              value={province}
              onChange={(e) => onProvinceChange(e.target.value)}
            >
              {CHINA_PROVINCES.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
              <option value={UNKNOWN_PROVINCE}>{UNKNOWN_PROVINCE}</option>
            </MysticSelect>
          </FormFieldShell>

          <FormFieldShell label="地级行政区" htmlFor="citySelect">
            <MysticSelect
              id="citySelect"
              value={city}
              disabled={isUnknown}
              onChange={(e) => {
                setCity(e.target.value);
                setManualLon("");
                setManualLat("");
              }}
            >
              {isUnknown ? (
                <option value={UNKNOWN_CITY}>{UNKNOWN_CITY}</option>
              ) : (
                cities.map((c) => (
                  <option key={c.city} value={c.city}>
                    {c.city}
                  </option>
                ))
              )}
            </MysticSelect>
          </FormFieldShell>

          <FormFieldShell label="关注方向" htmlFor="focusArea">
            <MysticSelect id="focusArea" name="focusArea" defaultValue="overall">
              <option value="overall">综合</option>
              <option value="love">感情</option>
              <option value="career">事业</option>
              <option value="wealth">财运</option>
              <option value="study">学业</option>
              <option value="health">生活方式</option>
            </MysticSelect>
          </FormFieldShell>
          <FormFieldShell label="流年（可选）" htmlFor="targetYear">
            <MysticInput id="targetYear" name="targetYear" type="number" placeholder="2026" />
          </FormFieldShell>
        </div>

        {!isUnknown && cityEntry && (
          <div className="rounded-xl border border-[var(--border-soft)] bg-[rgba(139,92,246,0.04)] p-3 text-xs text-[var(--text-muted)]">
            <p>
              经纬度约 {displayLon}°E，{displayLat}°N · 时区 Asia/Shanghai
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {cityEntry.climateTags.map((t) => (
                <PillBadge key={t} variant="muted">
                  {t}
                </PillBadge>
              ))}
            </div>
            <p className="mt-2 text-[var(--text-dim)]">
              {describeRegionElementBias(cityEntry.elementBias)}
            </p>
          </div>
        )}

        {isUnknown && (
          <p className="rounded-lg border border-[var(--border-soft)] px-3 py-2 text-xs text-[var(--warning)]">
            未选择出生地，将不使用真太阳时修正。
          </p>
        )}

        <FormFieldShell label="出生地备注（可选）" htmlFor="birthPlaceNote">
          <MysticInput
            id="birthPlaceNote"
            name="birthPlaceNote"
            placeholder="如：具体医院、乡镇等，仅作记录"
          />
        </FormFieldShell>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border-purple)] bg-[rgba(139,92,246,0.04)] px-4 py-3">
          <input
            type="checkbox"
            name="useTrueSolarTime"
            defaultChecked
            disabled={isUnknown}
            className="h-4 w-4 rounded border-[var(--border-purple)] accent-[var(--purple-primary)]"
          />
          <span className="text-sm text-[var(--text-muted)]">
            使用真太阳时校正（根据出生地经度自动计算）
          </span>
        </label>

        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="text-xs text-[var(--gold-main)] hover:underline"
        >
          {advancedOpen ? "收起高级设置" : "展开高级设置"}
        </button>

        {advancedOpen && (
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-[var(--border-soft)] p-4 md:grid-cols-2">
            <FormFieldShell label="手动经度" htmlFor="manualLon" description="覆盖城市默认值">
              <MysticInput
                id="manualLon"
                type="number"
                step="0.0001"
                value={manualLon}
                onChange={(e) => setManualLon(e.target.value)}
                placeholder={cityEntry?.longitude.toFixed(4)}
                disabled={isUnknown}
              />
            </FormFieldShell>
            <FormFieldShell label="手动纬度" htmlFor="manualLat">
              <MysticInput
                id="manualLat"
                type="number"
                step="0.0001"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                placeholder={cityEntry?.latitude.toFixed(4)}
                disabled={isUnknown}
              />
            </FormFieldShell>
            <FormFieldShell label="时区" htmlFor="timezone">
              <MysticInput id="timezone" name="timezone" defaultValue="Asia/Shanghai" />
            </FormFieldShell>
            <FormFieldShell label="换日规则" htmlFor="dayBoundaryMode">
              <MysticSelect id="dayBoundaryMode" name="dayBoundaryMode" defaultValue="midnight">
                <option value="midnight">午夜换日</option>
                <option value="ziHour">子时初换日 (23:00)</option>
              </MysticSelect>
            </FormFieldShell>
          </div>
        )}

        <MysticButton
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full"
        >
          {loading ? "正在校准节气与四柱…" : "开始排盘"}
        </MysticButton>
      </form>
    </MysticCard>
  );
}
