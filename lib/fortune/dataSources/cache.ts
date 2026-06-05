const CACHE_PREFIX = "keyline.cache.";

export const CALIBRATION_CACHE_PREFIX = CACHE_PREFIX;

export const CACHE_TTL_MS = {
  solarTerms: 365 * 24 * 60 * 60 * 1000,
  location: 90 * 24 * 60 * 60 * 1000,
  timezone: 180 * 24 * 60 * 60 * 1000,
} as const;

interface CacheEnvelope<T> {
  version: 1;
  createdAt: string;
  expiresAt: string;
  value: T;
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function safeKeyPart(value: string | number): string {
  return String(value).trim().replace(/\s+/g, "_");
}

export function solarTermsCacheKey(year: number, timezone: string): string {
  return `${CACHE_PREFIX}solarTerms.${year}.${safeKeyPart(timezone)}`;
}

export function locationCacheKey(query: string): string {
  return `${CACHE_PREFIX}location.${safeKeyPart(query)}`;
}

export function timezoneCacheKey(latitude: number, longitude: number): string {
  return `${CACHE_PREFIX}timezone.${safeKeyPart(latitude)}.${safeKeyPart(longitude)}`;
}

function parseEnvelope<T>(raw: string | null): CacheEnvelope<T> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CacheEnvelope<T>>;
    if (
      parsed.version !== 1 ||
      typeof parsed.createdAt !== "string" ||
      typeof parsed.expiresAt !== "string" ||
      parsed.value === undefined
    ) {
      return null;
    }
    const expiresAt = new Date(parsed.expiresAt).getTime();
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;
    return parsed as CacheEnvelope<T>;
  } catch {
    return null;
  }
}

export function readCalibrationCache<T>(key: string): T | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const envelope = parseEnvelope<T>(storage.getItem(key));
    if (!envelope) {
      storage.removeItem(key);
      return null;
    }
    return envelope.value;
  } catch {
    return null;
  }
}

export function writeCalibrationCache<T>(
  key: string,
  value: T,
  ttlMs: number,
): void {
  const storage = getStorage();
  if (!storage) return;
  const now = Date.now();
  const envelope: CacheEnvelope<T> = {
    version: 1,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + ttlMs).toISOString(),
    value,
  };
  try {
    storage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Cache failure must never block a calculation.
  }
}

export function clearCalibrationCache(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => storage.removeItem(key));
  } catch {
    // Ignore blocked localStorage.
  }
}
