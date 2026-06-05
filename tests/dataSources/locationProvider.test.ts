import { beforeEach, describe, expect, it } from "vitest";
import {
  resolveLocationOnline,
  setLocationOnlineFetcherForTests,
} from "@/lib/fortune/dataSources/locationProvider";

describe("locationProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses built-in China city coordinates by default", async () => {
    const result = await resolveLocationOnline({
      query: "北京市北京市",
      country: "中国",
      preferOnline: false,
    });
    expect(result.meta.sourceType).toBe("local_builtin");
    expect(result.data.longitude).toBeCloseTo(116.4074, 2);
  });

  it("falls back to built-in China coordinates when online fails", async () => {
    const restore = setLocationOnlineFetcherForTests(async () => {
      throw new Error("offline");
    });
    const result = await resolveLocationOnline({
      query: "上海市上海市",
      country: "中国",
      preferOnline: true,
    });
    restore();
    expect(result.meta.fallbackUsed).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.data.longitude).toBeCloseTo(121.4737, 2);
  });

  it("requires manual coordinates when overseas online geocoding fails", async () => {
    const restore = setLocationOnlineFetcherForTests(async () => {
      throw new Error("offline");
    });
    const result = await resolveLocationOnline({
      query: "Atlantis",
      country: "US",
      preferOnline: false,
    });
    restore();
    expect(result.meta.sourceType).toBe("user_manual");
    expect(result.meta.fallbackUsed).toBe(true);
    expect(result.data.requiresManualCoordinates).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
