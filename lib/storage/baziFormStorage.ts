import type { BaziAlgorithmResult } from "@/lib/fortune/bazi";
import type { LuckOverviewSet } from "@/lib/fortune/luck";
import type { FortuneReport, RuleResult } from "@/lib/fortune/shared/reportTypes";
import type { CalculationStep, FortuneSuccessResponse } from "@/lib/fortune/shared/types";

export const BAZI_LAST_INPUT_KEY = "keyline.bazi.lastInput";
export const BAZI_LAST_RESULT_KEY = "keyline.bazi.lastResult";

export interface SavedBaziFormInput {
  name?: string;
  gender: "male" | "female" | "unknown";
  birthDate: string;
  birthTime: string;
  province?: string;
  city?: string;
  birthPlace?: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  useTrueSolarTime: boolean;
  focusArea: "overall" | "love" | "career" | "wealth" | "study" | "health";
  targetYear?: number;
  dayBoundaryMode: "midnight" | "ziHour";
  useOnlineSolarTerms?: boolean;
  useOnlineLocationCalibration?: boolean;
  overseasCountry?: string;
  overseasLocationQuery?: string;
  savedAt: string;
  version: 1;
}

export type BaziAnalysisResult = FortuneSuccessResponse<unknown, BaziAlgorithmResult> & {
  report: FortuneReport;
  rule_results: RuleResult[];
  calculation_steps: CalculationStep[];
  luckOverview?: LuckOverviewSet;
};

export interface SavedBaziResult {
  input: SavedBaziFormInput;
  result: BaziAnalysisResult;
  savedAt: string;
  version: 1;
}

const DEFAULT_INPUT: Omit<
  SavedBaziFormInput,
  "birthDate" | "birthTime" | "savedAt" | "version"
> = {
  gender: "unknown",
  timezone: "Asia/Shanghai",
  useTrueSolarTime: true,
  focusArea: "overall",
  dayBoundaryMode: "midnight",
  useOnlineSolarTerms: false,
  useOnlineLocationCalibration: false,
};

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function parseRaw(raw: unknown): unknown {
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

function validTime(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) return false;
  const [hour, minute] = value.split(":").map(Number);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function cleanString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function cleanNumber(value: unknown, min: number, max: number): number | undefined {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n) || n < min || n > max) return undefined;
  return n;
}

function cleanYear(value: unknown): number | undefined {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isInteger(n) || n < 1900 || n > 2100) return undefined;
  return n;
}

function cleanGender(value: unknown): SavedBaziFormInput["gender"] {
  return value === "male" || value === "female" || value === "unknown"
    ? value
    : DEFAULT_INPUT.gender;
}

function cleanFocus(value: unknown): SavedBaziFormInput["focusArea"] {
  return value === "love" ||
    value === "career" ||
    value === "wealth" ||
    value === "study" ||
    value === "health" ||
    value === "overall"
    ? value
    : DEFAULT_INPUT.focusArea;
}

function cleanBoundary(value: unknown): SavedBaziFormInput["dayBoundaryMode"] {
  return value === "ziHour" || value === "midnight" ? value : DEFAULT_INPUT.dayBoundaryMode;
}

export function normalizeSavedBaziInput(raw: unknown): SavedBaziFormInput | null {
  const obj = asRecord(parseRaw(raw));
  if (!obj) return null;

  if (obj.version !== undefined && obj.version !== 1) return null;
  if (!validDate(obj.birthDate) || !validTime(obj.birthTime)) return null;

  const options = asRecord(obj.options);
  const savedAt =
    typeof obj.savedAt === "string" && obj.savedAt
      ? obj.savedAt
      : new Date().toISOString();

  return {
    name: cleanString(obj.name),
    gender: cleanGender(obj.gender),
    birthDate: obj.birthDate,
    birthTime: obj.birthTime,
    province: cleanString(obj.province),
    city: cleanString(obj.city),
    birthPlace: cleanString(obj.birthPlace) ?? cleanString(obj.birthPlaceNote),
    latitude: cleanNumber(obj.latitude ?? obj.manualLatitude, -90, 90),
    longitude: cleanNumber(obj.longitude ?? obj.manualLongitude, -180, 180),
    timezone: cleanString(obj.timezone) ?? DEFAULT_INPUT.timezone,
    useTrueSolarTime:
      typeof obj.useTrueSolarTime === "boolean"
        ? obj.useTrueSolarTime
        : DEFAULT_INPUT.useTrueSolarTime,
    focusArea: cleanFocus(obj.focusArea),
    targetYear: cleanYear(obj.targetYear),
    dayBoundaryMode: cleanBoundary(obj.dayBoundaryMode ?? options?.dayBoundaryMode),
    useOnlineSolarTerms:
      typeof obj.useOnlineSolarTerms === "boolean"
        ? obj.useOnlineSolarTerms
        : typeof options?.useOnlineSolarTermCalibration === "boolean"
          ? options.useOnlineSolarTermCalibration
          : DEFAULT_INPUT.useOnlineSolarTerms,
    useOnlineLocationCalibration:
      typeof obj.useOnlineLocationCalibration === "boolean"
        ? obj.useOnlineLocationCalibration
        : typeof options?.useOnlineLocationCalibration === "boolean"
          ? options.useOnlineLocationCalibration
          : DEFAULT_INPUT.useOnlineLocationCalibration,
    overseasCountry:
      cleanString(obj.overseasCountry) ?? cleanString(options?.overseasCountry),
    overseasLocationQuery:
      cleanString(obj.overseasLocationQuery) ??
      cleanString(options?.overseasLocationQuery),
    savedAt,
    version: 1,
  };
}

function withFreshSavedAt(input: SavedBaziFormInput): SavedBaziFormInput {
  return { ...input, savedAt: new Date().toISOString(), version: 1 };
}

export function saveLastBaziInput(input: SavedBaziFormInput): void {
  const storage = getLocalStorage();
  if (!storage) return;
  const normalized = normalizeSavedBaziInput(input);
  if (!normalized) return;
  try {
    storage.setItem(BAZI_LAST_INPUT_KEY, JSON.stringify(withFreshSavedAt(normalized)));
  } catch {
    // localStorage may be blocked or full; form usage should keep working.
  }
}

export function loadLastBaziInput(): SavedBaziFormInput | null {
  const storage = getLocalStorage();
  if (!storage) return null;
  try {
    const normalized = normalizeSavedBaziInput(storage.getItem(BAZI_LAST_INPUT_KEY));
    if (!normalized) {
      storage.removeItem(BAZI_LAST_INPUT_KEY);
      return null;
    }
    return normalized;
  } catch {
    return null;
  }
}

export function clearLastBaziInput(): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(BAZI_LAST_INPUT_KEY);
  } catch {
    // ignore
  }
}

function normalizeSavedBaziResult(raw: unknown): SavedBaziResult | null {
  const obj = asRecord(parseRaw(raw));
  if (!obj || obj.version !== 1) return null;
  const input = normalizeSavedBaziInput(obj.input);
  const result = asRecord(obj.result);
  if (!input || !result) return null;
  if (!result.algorithm_result || !result.report || !result.calculation_steps) {
    return null;
  }
  return {
    input,
    result: result as unknown as BaziAnalysisResult,
    savedAt:
      typeof obj.savedAt === "string" && obj.savedAt
        ? obj.savedAt
        : input.savedAt,
    version: 1,
  };
}

export function saveLastBaziResult(
  input: SavedBaziFormInput,
  result: BaziAnalysisResult,
): void {
  const storage = getLocalStorage();
  const normalized = normalizeSavedBaziInput(input);
  if (!normalized) return;

  saveLastBaziInput(normalized);
  if (!storage) return;

  const savedAt = new Date().toISOString();
  const payload: SavedBaziResult = {
    input: { ...normalized, savedAt },
    result,
    savedAt,
    version: 1,
  };

  try {
    storage.setItem(BAZI_LAST_RESULT_KEY, JSON.stringify(payload));
  } catch {
    saveLastBaziInput(normalized);
  }
}

export function loadLastBaziResult(): SavedBaziResult | null {
  const storage = getLocalStorage();
  if (!storage) return null;
  try {
    const normalized = normalizeSavedBaziResult(storage.getItem(BAZI_LAST_RESULT_KEY));
    if (!normalized) {
      storage.removeItem(BAZI_LAST_RESULT_KEY);
      return null;
    }
    return normalized;
  } catch {
    return null;
  }
}

export function clearLastBaziResult(): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(BAZI_LAST_RESULT_KEY);
  } catch {
    // ignore
  }
}

export function savedBaziInputsEqual(
  a: SavedBaziFormInput | null | undefined,
  b: SavedBaziFormInput | null | undefined,
): boolean {
  const left = normalizeSavedBaziInput(a);
  const right = normalizeSavedBaziInput(b);
  if (!left || !right) return false;

  const stripMeta = (input: SavedBaziFormInput) => {
    const { savedAt: _savedAt, version: _version, ...rest } = input;
    return rest;
  };

  return JSON.stringify(stripMeta(left)) === JSON.stringify(stripMeta(right));
}
