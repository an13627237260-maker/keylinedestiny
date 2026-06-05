"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  clearLastBaziInput,
  clearLastBaziResult,
  loadLastBaziInput,
  normalizeSavedBaziInput,
  saveLastBaziInput,
  type SavedBaziFormInput,
} from "@/lib/storage/baziFormStorage";
import { clearCalibrationCache } from "@/lib/fortune/dataSources/cache";
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

type FormState = {
  name: string;
  gender: SavedBaziFormInput["gender"];
  birthDate: string;
  birthTime: string;
  province: string;
  city: string;
  birthPlace: string;
  timezone: string;
  useTrueSolarTime: boolean;
  focusArea: SavedBaziFormInput["focusArea"];
  targetYear: string;
  dayBoundaryMode: SavedBaziFormInput["dayBoundaryMode"];
  manualLon: string;
  manualLat: string;
  useOnlineSolarTerms: boolean;
  useOnlineLocationCalibration: boolean;
  overseasCountry: string;
  overseasCity: string;
};

const DEFAULT_FORM_STATE: FormState = {
  name: "",
  gender: "unknown",
  birthDate: "",
  birthTime: "",
  province: DEFAULT_PROVINCE,
  city: DEFAULT_CITY,
  birthPlace: "",
  timezone: "Asia/Shanghai",
  useTrueSolarTime: true,
  focusArea: "overall",
  targetYear: "",
  dayBoundaryMode: "midnight",
  manualLon: "",
  manualLat: "",
  useOnlineSolarTerms: false,
  useOnlineLocationCalibration: false,
  overseasCountry: "",
  overseasCity: "",
};

function numberString(n: number | undefined): string {
  return typeof n === "number" && Number.isFinite(n) ? String(Number(n.toFixed(4))) : "";
}

function findValidProvince(province?: string): string {
  if (province === UNKNOWN_PROVINCE) return UNKNOWN_PROVINCE;
  return CHINA_PROVINCES.some((p) => p.name === province)
    ? province ?? DEFAULT_PROVINCE
    : DEFAULT_PROVINCE;
}

function findValidCity(province: string, city?: string): string {
  if (province === UNKNOWN_PROVINCE) return UNKNOWN_CITY;
  const p = CHINA_PROVINCES.find((x) => x.name === province);
  if (!p) return DEFAULT_CITY;
  return p.cities.some((c) => c.city === city) ? city! : p.cities[0]?.city ?? "";
}

function stateFromSaved(input: SavedBaziFormInput): FormState {
  const province = findValidProvince(input.province);
  const city = findValidCity(province, input.city);
  const cityEntry = province === UNKNOWN_PROVINCE ? undefined : getCityEntry(province, city);

  const savedLon = input.longitude;
  const savedLat = input.latitude;
  const cityLon = cityEntry?.longitude;
  const cityLat = cityEntry?.latitude;
  const lonDiff =
    savedLon !== undefined && cityLon !== undefined
      ? Math.abs(savedLon - cityLon)
      : 0;
  const latDiff =
    savedLat !== undefined && cityLat !== undefined
      ? Math.abs(savedLat - cityLat)
      : 0;
  const hasManualCoords =
    savedLon !== undefined &&
    (province === UNKNOWN_PROVINCE ||
      cityEntry === undefined ||
      lonDiff > 0.0001 ||
      latDiff > 0.0001);

  return {
    name: input.name ?? "",
    gender: input.gender,
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    province,
    city,
    birthPlace: input.birthPlace ?? "",
    timezone: input.timezone,
    useTrueSolarTime: input.useTrueSolarTime,
    focusArea: input.focusArea,
    targetYear: input.targetYear ? String(input.targetYear) : "",
    dayBoundaryMode: input.dayBoundaryMode,
    manualLon: hasManualCoords ? numberString(savedLon) : "",
    manualLat: hasManualCoords ? numberString(savedLat) : "",
    useOnlineSolarTerms: input.useOnlineSolarTerms ?? false,
    useOnlineLocationCalibration: input.useOnlineLocationCalibration ?? false,
    overseasCountry: input.overseasCountry ?? "",
    overseasCity: input.overseasLocationQuery ?? "",
  };
}

function savedInputFromState(
  state: FormState,
  cityEntry: ReturnType<typeof getCityEntry> | undefined,
): SavedBaziFormInput | null {
  const isUnknown = state.province === UNKNOWN_PROVINCE;
  const longitude = state.manualLon
    ? Number(state.manualLon)
    : isUnknown
      ? undefined
      : cityEntry?.longitude;
  const latitude = state.manualLat
    ? Number(state.manualLat)
    : isUnknown
      ? undefined
      : cityEntry?.latitude;

  return normalizeSavedBaziInput({
    name: state.name || undefined,
    gender: state.gender,
    birthDate: state.birthDate,
    birthTime: state.birthTime,
    province: state.province,
    city: state.city,
    birthPlace: state.birthPlace || undefined,
    latitude,
    longitude,
    timezone: state.timezone || "Asia/Shanghai",
    useTrueSolarTime: state.useTrueSolarTime,
    focusArea: state.focusArea,
    targetYear: state.targetYear ? Number(state.targetYear) : undefined,
    dayBoundaryMode: state.dayBoundaryMode,
    useOnlineSolarTerms: state.useOnlineSolarTerms,
    useOnlineLocationCalibration: state.useOnlineLocationCalibration,
    overseasCountry: state.overseasCountry || undefined,
    overseasLocationQuery: state.overseasCity || undefined,
    savedAt: new Date().toISOString(),
    version: 1,
  });
}

export function BaziForm({
  loading,
  onSubmit,
  onRestoredInput,
  onInputChange,
  onClear,
}: {
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onRestoredInput?: (input: SavedBaziFormInput) => void;
  onInputChange?: (input: SavedBaziFormInput | null) => void;
  onClear?: () => void;
}) {
  const [state, setState] = useState<FormState>(DEFAULT_FORM_STATE);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [restored, setRestored] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [cacheNotice, setCacheNotice] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const isUnknown = state.province === UNKNOWN_PROVINCE;
  const hasManualCoordinates = Boolean(state.manualLon && state.manualLat);
  const hasOverseasQuery = Boolean(state.overseasCity.trim());
  const canUseTrueSolarTime = !isUnknown || hasManualCoordinates || hasOverseasQuery;

  const cities = useMemo(() => {
    if (isUnknown) return [];
    const p = CHINA_PROVINCES.find((x) => x.name === state.province);
    return p?.cities ?? [];
  }, [state.province, isUnknown]);

  const cityEntry = useMemo(() => {
    if (isUnknown) return undefined;
    return getCityEntry(state.province, state.city);
  }, [state.province, state.city, isUnknown]);

  const currentSavedInput = useMemo(
    () => savedInputFromState(state, cityEntry),
    [state, cityEntry],
  );

  const displayLon = state.manualLon || cityEntry?.longitude?.toFixed(4) || "";
  const displayLat = state.manualLat || cityEntry?.latitude?.toFixed(4) || "";

  useEffect(() => {
    const saved = loadLastBaziInput();
    if (saved) {
      setState(stateFromSaved(saved));
      setRestored(true);
      setAdvancedOpen(Boolean(saved.longitude || saved.latitude));
      onRestoredInput?.(saved);
      onInputChange?.(saved);
    }
    setHydrated(true);
  }, [onInputChange, onRestoredInput]);

  useEffect(() => {
    if (!hydrated) return;
    onInputChange?.(currentSavedInput);
    if (!currentSavedInput) return;

    const id = window.setTimeout(() => {
      saveLastBaziInput(currentSavedInput);
    }, 500);
    return () => window.clearTimeout(id);
  }, [currentSavedInput, hydrated, onInputChange]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function onProvinceChange(next: string) {
    if (next === UNKNOWN_PROVINCE) {
      setState((prev) => ({
        ...prev,
        province: next,
        city: UNKNOWN_CITY,
        manualLon: "",
        manualLat: "",
        useTrueSolarTime: prev.useTrueSolarTime,
      }));
      return;
    }
    const p = CHINA_PROVINCES.find((x) => x.name === next);
    setState((prev) => ({
      ...prev,
      province: next,
      city: p?.cities[0]?.city ?? "",
      manualLon: "",
      manualLat: "",
      useTrueSolarTime: prev.useTrueSolarTime,
    }));
  }

  function handleClear() {
    clearLastBaziInput();
    clearLastBaziResult();
    setState(DEFAULT_FORM_STATE);
    setRestored(false);
    setAdvancedOpen(false);
    onInputChange?.(null);
    onClear?.();
  }

  function handleClearCalibrationCache() {
    clearCalibrationCache();
    setCacheNotice("校准缓存已清除");
    window.setTimeout(() => setCacheNotice(""), 2500);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (currentSavedInput) saveLastBaziInput(currentSavedInput);
    onSubmit(e);
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
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {restored && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[rgba(139,92,246,0.04)] px-3 py-2 text-xs text-[var(--text-muted)]">
            <span className="mr-auto text-[var(--text-muted)]">已恢复上次填写的信息</span>
            <button
              type="button"
              onClick={handleClear}
              className="min-h-[32px] rounded-md border border-[var(--border-soft)] px-2 text-[var(--text-dim)] hover:text-[var(--text-main)]"
            >
              清空
            </button>
            <button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              className="min-h-[32px] rounded-md border border-[var(--gold-main)]/40 px-2 text-[var(--gold-main)] hover:bg-[rgba(214,181,109,0.08)]"
            >
              使用上次信息重新排盘
            </button>
          </div>
        )}

        <input type="hidden" name="province" value={state.province} />
        <input type="hidden" name="city" value={state.city} />
        <input type="hidden" name="locationUnknown" value={isUnknown ? "on" : ""} />
        {state.manualLon && <input type="hidden" name="manualLongitude" value={state.manualLon} />}
        {state.manualLat && <input type="hidden" name="manualLatitude" value={state.manualLat} />}
        <input
          type="hidden"
          name="useOnlineSolarTermCalibration"
          value={state.useOnlineSolarTerms ? "on" : ""}
        />
        <input
          type="hidden"
          name="useOnlineLocationCalibration"
          value={state.useOnlineLocationCalibration ? "on" : ""}
        />
        <input type="hidden" name="overseasCountry" value={state.overseasCountry} />
        <input type="hidden" name="overseasLocationQuery" value={state.overseasCity} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormFieldShell label="姓名（可选）" htmlFor="name">
            <MysticInput
              id="name"
              name="name"
              placeholder="可选"
              value={state.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </FormFieldShell>
          <FormFieldShell label="性别" htmlFor="gender">
            <MysticSelect
              id="gender"
              name="gender"
              value={state.gender}
              onChange={(e) => update("gender", e.target.value as FormState["gender"])}
            >
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="unknown">未说明</option>
            </MysticSelect>
          </FormFieldShell>
          <FormFieldShell label="出生日期" htmlFor="birthDate">
            <MysticInput
              id="birthDate"
              name="birthDate"
              type="date"
              required
              value={state.birthDate}
              onChange={(e) => update("birthDate", e.target.value)}
            />
          </FormFieldShell>
          <FormFieldShell label="出生时间" htmlFor="birthTime">
            <MysticInput
              id="birthTime"
              name="birthTime"
              type="time"
              required
              value={state.birthTime}
              onChange={(e) => update("birthTime", e.target.value)}
            />
          </FormFieldShell>

          <FormFieldShell label="省级行政区" htmlFor="provinceSelect">
            <MysticSelect
              id="provinceSelect"
              value={state.province}
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
              value={state.city}
              disabled={isUnknown}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  city: e.target.value,
                  manualLon: "",
                  manualLat: "",
                }))
              }
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
            <MysticSelect
              id="focusArea"
              name="focusArea"
              value={state.focusArea}
              onChange={(e) => update("focusArea", e.target.value as FormState["focusArea"])}
            >
              <option value="overall">综合</option>
              <option value="love">感情</option>
              <option value="career">事业</option>
              <option value="wealth">财运</option>
              <option value="study">学业</option>
              <option value="health">生活方式</option>
            </MysticSelect>
          </FormFieldShell>
          <FormFieldShell label="流年（可选）" htmlFor="targetYear">
            <MysticInput
              id="targetYear"
              name="targetYear"
              type="number"
              placeholder="2026"
              value={state.targetYear}
              onChange={(e) => update("targetYear", e.target.value)}
            />
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
            未选择中国出生地。可在高级设置输入海外城市并联网校准，或手动填写经纬度继续排盘。
          </p>
        )}

        <FormFieldShell label="出生地备注（可选）" htmlFor="birthPlace">
          <MysticInput
            id="birthPlace"
            name="birthPlace"
            placeholder="如：具体医院、乡镇等，仅作记录"
            value={state.birthPlace}
            onChange={(e) => update("birthPlace", e.target.value)}
          />
        </FormFieldShell>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border-purple)] bg-[rgba(139,92,246,0.04)] px-4 py-3">
          <input
            type="checkbox"
            name="useTrueSolarTime"
            checked={canUseTrueSolarTime && state.useTrueSolarTime}
            disabled={!canUseTrueSolarTime}
            onChange={(e) => update("useTrueSolarTime", e.target.checked)}
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
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-[var(--text-main)]">校准设置</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-dim)]">
                联网校准仅用于查询节气、经纬度或时区等客观数据，不会上传完整命盘报告。你也可以关闭联网校准，系统会使用本地内置数据。
              </p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border-soft)] bg-[rgba(139,92,246,0.04)] px-4 py-3">
              <input
                type="checkbox"
                checked={state.useOnlineSolarTerms}
                onChange={(e) => update("useOnlineSolarTerms", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--border-purple)] accent-[var(--purple-primary)]"
              />
              <span>
                <span className="block text-sm text-[var(--text-muted)]">
                  使用联网校准节气
                </span>
                <span className="mt-1 block text-xs text-[var(--text-dim)]">
                  默认关闭；联网失败会自动使用本地近似算法。
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border-soft)] bg-[rgba(139,92,246,0.04)] px-4 py-3">
              <input
                type="checkbox"
                checked={state.useOnlineLocationCalibration}
                onChange={(e) => update("useOnlineLocationCalibration", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--border-purple)] accent-[var(--purple-primary)]"
              />
              <span>
                <span className="block text-sm text-[var(--text-muted)]">
                  使用联网校准出生地坐标
                </span>
                <span className="mt-1 block text-xs text-[var(--text-dim)]">
                  中国城市通常不需要；海外地点会按输入城市尝试查询。
                </span>
              </span>
            </label>

            <FormFieldShell label="海外国家 / 地区" htmlFor="overseasCountry" description="仅海外出生地需要">
              <MysticInput
                id="overseasCountry"
                value={state.overseasCountry}
                onChange={(e) => update("overseasCountry", e.target.value)}
                placeholder="如 United States / Japan"
              />
            </FormFieldShell>
            <FormFieldShell label="海外城市 / 地点" htmlFor="overseasCity" description="只发送地点文本，不发送姓名或完整出生时间">
              <MysticInput
                id="overseasCity"
                value={state.overseasCity}
                onChange={(e) => update("overseasCity", e.target.value)}
                placeholder="如 New York / Tokyo"
              />
            </FormFieldShell>

            <FormFieldShell label="手动经度" htmlFor="manualLon" description="覆盖城市默认值">
              <MysticInput
                id="manualLon"
                type="number"
                step="0.0001"
                value={state.manualLon}
                onChange={(e) => update("manualLon", e.target.value)}
                placeholder={cityEntry?.longitude.toFixed(4)}
              />
            </FormFieldShell>
            <FormFieldShell label="手动纬度" htmlFor="manualLat">
              <MysticInput
                id="manualLat"
                type="number"
                step="0.0001"
                value={state.manualLat}
                onChange={(e) => update("manualLat", e.target.value)}
                placeholder={cityEntry?.latitude.toFixed(4)}
              />
            </FormFieldShell>
            <FormFieldShell label="时区" htmlFor="timezone">
              <MysticInput
                id="timezone"
                name="timezone"
                value={state.timezone}
                onChange={(e) => update("timezone", e.target.value)}
              />
            </FormFieldShell>
            <FormFieldShell label="换日规则" htmlFor="dayBoundaryMode">
              <MysticSelect
                id="dayBoundaryMode"
                name="dayBoundaryMode"
                value={state.dayBoundaryMode}
                onChange={(e) =>
                  update("dayBoundaryMode", e.target.value as FormState["dayBoundaryMode"])
                }
              >
                <option value="midnight">午夜换日</option>
                <option value="ziHour">子时初换日 (23:00)</option>
              </MysticSelect>
            </FormFieldShell>
            <div className="flex flex-wrap items-center gap-2 md:col-span-2">
              <button
                type="button"
                onClick={handleClearCalibrationCache}
                className="min-h-[36px] rounded-md border border-[var(--border-soft)] px-3 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                清除校准缓存
              </button>
              {cacheNotice && (
                <span className="text-xs text-[var(--gold-main)]">{cacheNotice}</span>
              )}
            </div>
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
