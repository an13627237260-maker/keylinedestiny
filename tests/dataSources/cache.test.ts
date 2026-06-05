import { beforeEach, describe, expect, it } from "vitest";
import {
  CACHE_TTL_MS,
  CALIBRATION_CACHE_PREFIX,
  clearCalibrationCache,
  locationCacheKey,
  readCalibrationCache,
  solarTermsCacheKey,
  timezoneCacheKey,
  writeCalibrationCache,
} from "@/lib/fortune/dataSources/cache";

describe("calibration cache", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses the keyline cache prefix and typed cache keys", () => {
    expect(solarTermsCacheKey(2026, "Asia/Shanghai")).toContain(
      `${CALIBRATION_CACHE_PREFIX}solarTerms.2026.Asia/Shanghai`,
    );
    expect(locationCacheKey("北京")).toBe(`${CALIBRATION_CACHE_PREFIX}location.北京`);
    expect(timezoneCacheKey(39.9, 116.4)).toBe(
      `${CALIBRATION_CACHE_PREFIX}timezone.39.9.116.4`,
    );
  });

  it("writes and reads cache values", () => {
    const key = locationCacheKey("上海");
    writeCalibrationCache(key, { ok: true }, CACHE_TTL_MS.location);
    expect(readCalibrationCache<{ ok: boolean }>(key)?.ok).toBe(true);
  });

  it("ignores damaged cache values", () => {
    const key = locationCacheKey("damaged");
    localStorage.setItem(key, "{bad-json");
    expect(readCalibrationCache(key)).toBeNull();
    expect(localStorage.getItem(key)).toBeNull();
  });

  it("clears only calibration cache entries", () => {
    writeCalibrationCache(locationCacheKey("北京"), { ok: true }, CACHE_TTL_MS.location);
    localStorage.setItem("keyline.bazi.lastInput", "keep");
    clearCalibrationCache();
    expect(readCalibrationCache(locationCacheKey("北京"))).toBeNull();
    expect(localStorage.getItem("keyline.bazi.lastInput")).toBe("keep");
  });
});
