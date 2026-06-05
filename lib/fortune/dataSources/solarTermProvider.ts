import { DateTime } from "luxon";
import {
  getBuiltInSolarTerms,
  type SolarTerm,
} from "../bazi/solarTerms";
import {
  CACHE_TTL_MS,
  readCalibrationCache,
  solarTermsCacheKey,
  writeCalibrationCache,
} from "./cache";
import type {
  OnlineRequestOptions,
  ProviderResult,
} from "./types";
import { DEFAULT_ONLINE_TIMEOUT_MS } from "./types";

interface SolarTermCachePayload {
  fetchedAt: string;
  terms: Array<{
    name: string;
    index: number;
    dateTimeIso: string;
  }>;
}

export type SolarTermOnlineFetcher = (
  year: number,
  timezone: string,
  options?: OnlineRequestOptions,
) => Promise<SolarTerm[]>;

async function unavailableSolarTermFetcher(): Promise<SolarTerm[]> {
  throw new Error("Online solar term provider is not configured.");
}

let onlineFetcher: SolarTermOnlineFetcher = unavailableSolarTermFetcher;

export function setSolarTermOnlineFetcherForTests(
  fetcher: SolarTermOnlineFetcher,
): () => void {
  const previous = onlineFetcher;
  onlineFetcher = fetcher;
  return () => {
    onlineFetcher = previous;
  };
}

export async function fetchSolarTermsOnline(
  year: number,
  timezone: string,
  options?: OnlineRequestOptions,
): Promise<SolarTerm[]> {
  return onlineFetcher(year, timezone, options);
}

function serializeTerms(terms: SolarTerm[]): SolarTermCachePayload["terms"] {
  return terms.map((term) => ({
    name: term.name,
    index: term.index,
    dateTimeIso: term.dateTime.toISO() ?? "",
  }));
}

function deserializeTerms(
  payload: SolarTermCachePayload,
  timezone: string,
): SolarTerm[] | null {
  const terms = payload.terms.map((term) => {
    const dt = DateTime.fromISO(term.dateTimeIso, { zone: timezone });
    return {
      name: term.name,
      index: term.index,
      dateTime: dt,
    };
  });
  if (terms.some((term) => !term.dateTime.isValid)) return null;
  return terms;
}

function localSolarTermsResult(
  year: number,
  timezone: string,
  fallbackUsed: boolean,
  warnings: string[] = [],
): ProviderResult<SolarTerm[]> {
  return {
    data: getBuiltInSolarTerms(year, timezone),
    meta: {
      sourceType: "approx_algorithm",
      providerName: "内置寿星节气近似算法",
      confidence: "medium",
      fallbackUsed,
      requestedOnline: fallbackUsed,
      notes: fallbackUsed
        ? ["在线节气校准不可用，已回退到本地近似算法。"]
        : ["用户未开启联网节气校准，直接使用本地近似算法。"],
    },
    warnings,
  };
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = DEFAULT_ONLINE_TIMEOUT_MS,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`Online solar term request timed out after ${timeoutMs}ms.`)),
      timeoutMs,
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function getCalibratedSolarTerms(options: {
  year: number;
  timezone: string;
  preferOnline: boolean;
  timeoutMs?: number;
}): Promise<ProviderResult<SolarTerm[]>> {
  const { year, timezone, preferOnline } = options;

  if (!preferOnline) {
    return localSolarTermsResult(year, timezone, false);
  }

  const cacheKey = solarTermsCacheKey(year, timezone);
  const cached = readCalibrationCache<SolarTermCachePayload>(cacheKey);
  if (cached) {
    const terms = deserializeTerms(cached, timezone);
    if (terms) {
      return {
        data: terms,
        meta: {
          sourceType: "online_verified",
          providerName: "联网节气数据缓存",
          fetchedAt: cached.fetchedAt,
          confidence: "high",
          fallbackUsed: false,
          fromCache: true,
          requestedOnline: true,
          notes: ["命中本地校准缓存，未重复发起节气联网请求。"],
        },
        warnings: [],
      };
    }
  }

  try {
    const terms = await withTimeout(
      fetchSolarTermsOnline(year, timezone, {
        timeoutMs: options.timeoutMs ?? DEFAULT_ONLINE_TIMEOUT_MS,
      }),
      options.timeoutMs ?? DEFAULT_ONLINE_TIMEOUT_MS,
    );
    const fetchedAt = new Date().toISOString();
    writeCalibrationCache<SolarTermCachePayload>(
      cacheKey,
      { fetchedAt, terms: serializeTerms(terms) },
      CACHE_TTL_MS.solarTerms,
    );
    return {
      data: terms,
      meta: {
        sourceType: "online_verified",
        providerName: "可替换在线节气数据源",
        fetchedAt,
        confidence: "high",
        fallbackUsed: false,
        requestedOnline: true,
        notes: ["已取得联网节气时间，并写入校准缓存。"],
      },
      warnings: [],
    };
  } catch {
    return localSolarTermsResult(year, timezone, true, [
      "在线节气校准失败，已使用本地近似算法。",
    ]);
  }
}
