import { DateTime } from "luxon";
import {
  CACHE_TTL_MS,
  readCalibrationCache,
  timezoneCacheKey,
  writeCalibrationCache,
} from "./cache";
import {
  DEFAULT_ONLINE_TIMEOUT_MS,
  type OnlineRequestOptions,
  type ProviderResult,
  type ResolvedTimezone,
} from "./types";

interface TimezoneCachePayload {
  fetchedAt: string;
  timezone: ResolvedTimezone;
}

export type TimezoneOnlineFetcher = (
  options: {
    latitude: number;
    longitude: number;
    date?: string;
  },
  request?: OnlineRequestOptions & { signal?: AbortSignal },
) => Promise<ResolvedTimezone>;

function isLikelyChinaCoordinate(latitude: number, longitude: number): boolean {
  return latitude >= 18 && latitude <= 54 && longitude >= 73 && longitude <= 135;
}

function offsetForTimezone(timezone: string, date?: string): number {
  const dt = date
    ? DateTime.fromISO(`${date}T12:00:00`, { zone: timezone })
    : DateTime.now().setZone(timezone);
  return dt.isValid ? dt.offset : 480;
}

function fallbackResult(
  timezone: string,
  source: "local_builtin" | "user_manual",
  requestedOnline: boolean,
  fallbackUsed: boolean,
  date?: string,
  warnings: string[] = [],
): ProviderResult<ResolvedTimezone> {
  return {
    data: {
      timezone,
      utcOffsetMinutes: offsetForTimezone(timezone, date),
      daylightSaving: false,
    },
    meta: {
      sourceType: source,
      providerName: source === "local_builtin" ? "默认 Asia/Shanghai" : "用户选择时区",
      confidence: fallbackUsed ? "medium" : "high",
      fallbackUsed,
      requestedOnline,
      notes: fallbackUsed
        ? [`联网时区解析失败，已使用 ${timezone}。`]
        : [`未开启联网时区校准，使用 ${timezone}。`],
    },
    warnings,
  };
}

async function defaultTimezoneFetcher(
  options: { latitude: number; longitude: number; date?: string },
  request?: OnlineRequestOptions & { signal?: AbortSignal },
): Promise<ResolvedTimezone> {
  if (typeof fetch !== "function") {
    throw new Error("fetch is not available in this environment.");
  }
  const url = new URL("https://timeapi.io/api/TimeZone/coordinate");
  url.searchParams.set("latitude", String(options.latitude));
  url.searchParams.set("longitude", String(options.longitude));
  const response = await fetch(url.toString(), {
    signal: request?.signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Timezone request failed with ${response.status}.`);
  }
  const json = (await response.json()) as {
    timeZone?: string;
    timezone?: string;
    currentUtcOffset?: { seconds?: number; milliseconds?: number };
    utcOffset?: string;
    hasDayLightSaving?: boolean;
    daylightSaving?: boolean;
  };
  const timezone = json.timeZone ?? json.timezone;
  if (!timezone) throw new Error("Timezone response did not include IANA id.");
  const dateOffset = offsetForTimezone(timezone, options.date);
  const responseOffset =
    typeof json.currentUtcOffset?.seconds === "number"
      ? json.currentUtcOffset.seconds / 60
      : typeof json.currentUtcOffset?.milliseconds === "number"
        ? json.currentUtcOffset.milliseconds / 60_000
        : dateOffset;
  return {
    timezone,
    utcOffsetMinutes: Number.isFinite(dateOffset) ? dateOffset : responseOffset,
    daylightSaving: json.hasDayLightSaving ?? json.daylightSaving,
  };
}

let onlineFetcher: TimezoneOnlineFetcher = defaultTimezoneFetcher;

export function setTimezoneOnlineFetcherForTests(
  fetcher: TimezoneOnlineFetcher,
): () => void {
  const previous = onlineFetcher;
  onlineFetcher = fetcher;
  return () => {
    onlineFetcher = previous;
  };
}

export async function fetchTimezoneOnline(
  options: { latitude: number; longitude: number; date?: string },
  request?: OnlineRequestOptions,
): Promise<ResolvedTimezone> {
  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : undefined;
  const timeoutId = controller
    ? setTimeout(
        () => controller.abort(),
        request?.timeoutMs ?? DEFAULT_ONLINE_TIMEOUT_MS,
      )
    : undefined;
  try {
    return await onlineFetcher(options, {
      ...request,
      signal: controller?.signal,
    });
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function resolveTimezoneOnline(options: {
  latitude: number;
  longitude: number;
  date?: string;
  preferOnline: boolean;
  fallbackTimezone?: string;
  timeoutMs?: number;
}): Promise<ProviderResult<ResolvedTimezone>> {
  const fallbackTimezone =
    options.fallbackTimezone ||
    (isLikelyChinaCoordinate(options.latitude, options.longitude)
      ? "Asia/Shanghai"
      : "Asia/Shanghai");

  if (!options.preferOnline) {
    return fallbackResult(
      fallbackTimezone,
      fallbackTimezone === "Asia/Shanghai" ? "local_builtin" : "user_manual",
      false,
      false,
      options.date,
    );
  }

  const cacheKey = timezoneCacheKey(options.latitude, options.longitude);
  const cached = readCalibrationCache<TimezoneCachePayload>(cacheKey);
  if (cached) {
    return {
      data: cached.timezone,
      meta: {
        sourceType: "online_verified",
        providerName: "联网时区缓存",
        fetchedAt: cached.fetchedAt,
        confidence: "high",
        fallbackUsed: false,
        fromCache: true,
        requestedOnline: true,
        notes: ["命中时区校准缓存，未重复发起时区查询。"],
      },
      warnings: [],
    };
  }

  try {
    const timezone = await fetchTimezoneOnline(
      {
        latitude: options.latitude,
        longitude: options.longitude,
        date: options.date,
      },
      { timeoutMs: options.timeoutMs ?? DEFAULT_ONLINE_TIMEOUT_MS },
    );
    const fetchedAt = new Date().toISOString();
    writeCalibrationCache<TimezoneCachePayload>(
      cacheKey,
      { fetchedAt, timezone },
      CACHE_TTL_MS.timezone,
    );
    return {
      data: timezone,
      meta: {
        sourceType: "online_verified",
        providerName: "TimeAPI 坐标时区接口",
        fetchedAt,
        confidence: "high",
        fallbackUsed: false,
        requestedOnline: true,
        notes: ["仅发送经纬度与日期，不发送姓名或完整命盘报告。"],
      },
      warnings: [],
    };
  } catch {
    return fallbackResult(
      fallbackTimezone,
      fallbackTimezone === "Asia/Shanghai" ? "local_builtin" : "user_manual",
      true,
      true,
      options.date,
      [`联网时区解析失败，已使用 ${fallbackTimezone}。`],
    );
  }
}
