import { beforeEach, describe, expect, it } from "vitest";
import { getBuiltInSolarTerms } from "@/lib/fortune/bazi/solarTerms";
import {
  getCalibratedSolarTerms,
  setSolarTermOnlineFetcherForTests,
} from "@/lib/fortune/dataSources/solarTermProvider";

describe("solarTermProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses local approximate data when preferOnline=false", async () => {
    let called = 0;
    const restore = setSolarTermOnlineFetcherForTests(async () => {
      called += 1;
      return [];
    });
    const result = await getCalibratedSolarTerms({
      year: 2026,
      timezone: "Asia/Shanghai",
      preferOnline: false,
    });
    restore();
    expect(called).toBe(0);
    expect(result.meta.sourceType).toBe("approx_algorithm");
    expect(result.meta.fallbackUsed).toBe(false);
    expect(result.data).toHaveLength(24);
  });

  it("falls back to local data when online fails", async () => {
    const restore = setSolarTermOnlineFetcherForTests(async () => {
      throw new Error("offline");
    });
    const result = await getCalibratedSolarTerms({
      year: 2026,
      timezone: "Asia/Shanghai",
      preferOnline: true,
    });
    restore();
    expect(result.meta.fallbackUsed).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.data).toHaveLength(24);
  });

  it("does not repeat online requests when cache hits", async () => {
    let called = 0;
    const restore = setSolarTermOnlineFetcherForTests(async (year, timezone) => {
      called += 1;
      return getBuiltInSolarTerms(year, timezone);
    });
    await getCalibratedSolarTerms({
      year: 2026,
      timezone: "Asia/Shanghai",
      preferOnline: true,
    });
    const second = await getCalibratedSolarTerms({
      year: 2026,
      timezone: "Asia/Shanghai",
      preferOnline: true,
    });
    restore();
    expect(called).toBe(1);
    expect(second.meta.fromCache).toBe(true);
  });
});
