import {
  CHINA_PROVINCES,
} from "../location";
import {
  CACHE_TTL_MS,
  locationCacheKey,
  readCalibrationCache,
  writeCalibrationCache,
} from "./cache";
import {
  DEFAULT_ONLINE_TIMEOUT_MS,
  type OnlineRequestOptions,
  type ProviderResult,
  type ResolvedGeoLocation,
} from "./types";

interface LocationCachePayload {
  fetchedAt: string;
  location: ResolvedGeoLocation;
}

export type LocationOnlineFetcher = (
  options: {
    query: string;
    country?: string;
  },
  request?: OnlineRequestOptions & { signal?: AbortSignal },
) => Promise<ResolvedGeoLocation>;

function isChinaCountry(country?: string): boolean {
  if (!country) return false;
  const normalized = country.trim().toLowerCase();
  return ["cn", "china", "中国", "中华人民共和国"].includes(normalized);
}

function normalizeQuery(query: string): string {
  return query.replace(/\s+/g, "").toLowerCase();
}

function findChinaLocalLocation(
  query: string,
  country?: string,
): ResolvedGeoLocation | null {
  if (country && !isChinaCountry(country)) return null;
  const normalized = normalizeQuery(query);
  if (!normalized) return null;

  for (const province of CHINA_PROVINCES) {
    for (const city of province.cities) {
      const candidates = [
        city.city,
        `${city.province}${city.city}`,
        city.city.replace(/[市县区盟州地区特别行政区]/g, ""),
      ].map(normalizeQuery);
      if (candidates.some((candidate) => candidate && normalized.includes(candidate))) {
        return {
          name: `${city.province}${city.city}`,
          country: "中国",
          province: city.province,
          city: city.city,
          latitude: city.latitude,
          longitude: city.longitude,
          timezone: city.timezone,
        };
      }
    }
  }
  return null;
}

async function defaultLocationFetcher(
  options: { query: string; country?: string },
  request?: OnlineRequestOptions & { signal?: AbortSignal },
): Promise<ResolvedGeoLocation> {
  if (typeof fetch !== "function") {
    throw new Error("fetch is not available in this environment.");
  }
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", [options.query, options.country].filter(Boolean).join(", "));
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");
  if (options.country && /^[a-z]{2}$/i.test(options.country)) {
    url.searchParams.set("countrycodes", options.country.toLowerCase());
  }

  const response = await fetch(url.toString(), {
    signal: request?.signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Geocoding request failed with ${response.status}.`);
  }
  const rows = (await response.json()) as Array<{
    display_name?: string;
    lat?: string;
    lon?: string;
    address?: Record<string, string | undefined>;
  }>;
  const first = rows[0];
  const latitude = Number(first?.lat);
  const longitude = Number(first?.lon);
  if (!first || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Geocoding response did not include usable coordinates.");
  }
  const address = first.address ?? {};
  return {
    name: first.display_name ?? options.query,
    country: address.country ?? options.country ?? "",
    province: address.state ?? address.province,
    city: address.city ?? address.town ?? address.village ?? address.county,
    latitude,
    longitude,
  };
}

let onlineFetcher: LocationOnlineFetcher = defaultLocationFetcher;

export function setLocationOnlineFetcherForTests(
  fetcher: LocationOnlineFetcher,
): () => void {
  const previous = onlineFetcher;
  onlineFetcher = fetcher;
  return () => {
    onlineFetcher = previous;
  };
}

export async function fetchLocationOnline(
  options: { query: string; country?: string },
  request?: OnlineRequestOptions,
): Promise<ResolvedGeoLocation> {
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

function localChinaResult(
  local: ResolvedGeoLocation,
  requestedOnline: boolean,
  warnings: string[] = [],
): ProviderResult<ResolvedGeoLocation> {
  return {
    data: local,
    meta: {
      sourceType: "local_builtin",
      providerName: "中国内置省市坐标表",
      confidence: "high",
      fallbackUsed: requestedOnline,
      requestedOnline,
      notes: requestedOnline
        ? ["联网坐标校准失败，已回退到中国内置省市表。"]
        : ["中国城市默认使用本地内置省市坐标表。"],
    },
    warnings,
  };
}

function manualRequiredResult(
  query: string,
  country?: string,
): ProviderResult<ResolvedGeoLocation> {
  return {
    data: {
      name: query,
      country: country ?? "",
      requiresManualCoordinates: true,
    },
    meta: {
      sourceType: "user_manual",
      providerName: "用户手动补充经纬度",
      confidence: "low",
      fallbackUsed: true,
      requestedOnline: true,
      notes: ["海外出生地在线解析失败，需要用户手动输入经纬度后继续排盘。"],
    },
    warnings: ["海外出生地在线解析失败，请手动输入经纬度；排盘不会被阻止。"],
  };
}

function coordinateDelta(
  local: ResolvedGeoLocation,
  online: ResolvedGeoLocation,
): number {
  if (
    local.latitude === undefined ||
    local.longitude === undefined ||
    online.latitude === undefined ||
    online.longitude === undefined
  ) {
    return 0;
  }
  return Math.max(
    Math.abs(local.latitude - online.latitude),
    Math.abs(local.longitude - online.longitude),
  );
}

export async function resolveLocationOnline(options: {
  query: string;
  country?: string;
  preferOnline: boolean;
  timeoutMs?: number;
}): Promise<ProviderResult<ResolvedGeoLocation>> {
  const query = options.query.trim();
  const local = findChinaLocalLocation(query, options.country);

  if (local && !options.preferOnline) {
    return localChinaResult(local, false);
  }

  const shouldTryOnline = options.preferOnline || !local;
  if (!shouldTryOnline) {
    return local
      ? localChinaResult(local, false)
      : manualRequiredResult(query, options.country);
  }

  const cacheKey = locationCacheKey(query);
  const cached = readCalibrationCache<LocationCachePayload>(cacheKey);
  if (cached) {
    return {
      data: cached.location,
      meta: {
        sourceType: "online_verified",
        providerName: "联网地理编码缓存",
        fetchedAt: cached.fetchedAt,
        confidence: "high",
        fallbackUsed: false,
        fromCache: true,
        requestedOnline: true,
        notes: ["命中出生地坐标校准缓存，未重复发起地点查询。"],
      },
      warnings: [],
    };
  }

  try {
    const online = await fetchLocationOnline(
      { query, country: options.country },
      { timeoutMs: options.timeoutMs ?? DEFAULT_ONLINE_TIMEOUT_MS },
    );
    const fetchedAt = new Date().toISOString();
    writeCalibrationCache<LocationCachePayload>(
      cacheKey,
      { fetchedAt, location: online },
      CACHE_TTL_MS.location,
    );
    const warnings: string[] = [];
    if (local && coordinateDelta(local, online) > 0.5) {
      warnings.push("联网坐标与本地内置坐标差异超过 0.5 度，请确认出生地。");
    }
    return {
      data: online,
      meta: {
        sourceType: "online_verified",
        providerName: "OpenStreetMap Nominatim",
        fetchedAt,
        confidence: "high",
        fallbackUsed: false,
        requestedOnline: true,
        notes: ["仅发送地点查询文本与国家信息，不发送姓名或完整出生时间。"],
      },
      warnings,
    };
  } catch {
    if (local) {
      return localChinaResult(local, true, [
        "联网坐标校准失败，已使用中国内置省市坐标。",
      ]);
    }
    return manualRequiredResult(query, options.country);
  }
}

export function resolveLocalChinaLocationForQuery(
  query: string,
  country?: string,
): ResolvedGeoLocation | null {
  return findChinaLocalLocation(query, country);
}
