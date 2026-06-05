import { beforeEach, describe, expect, it } from "vitest";
import {
  resolveTimezoneOnline,
  setTimezoneOnlineFetcherForTests,
} from "@/lib/fortune/dataSources/timezoneProvider";

describe("timezoneProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses local/default timezone when preferOnline=false", async () => {
    const result = await resolveTimezoneOnline({
      latitude: 39.9042,
      longitude: 116.4074,
      date: "2026-05-15",
      preferOnline: false,
      fallbackTimezone: "Asia/Shanghai",
    });
    expect(result.meta.sourceType).toBe("local_builtin");
    expect(result.data.timezone).toBe("Asia/Shanghai");
    expect(result.data.utcOffsetMinutes).toBe(480);
  });

  it("falls back to selected timezone when online fails", async () => {
    const restore = setTimezoneOnlineFetcherForTests(async () => {
      throw new Error("offline");
    });
    const result = await resolveTimezoneOnline({
      latitude: 40.7128,
      longitude: -74.006,
      date: "1990-05-15",
      preferOnline: true,
      fallbackTimezone: "America/New_York",
    });
    restore();
    expect(result.meta.fallbackUsed).toBe(true);
    expect(result.data.timezone).toBe("America/New_York");
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("does not repeat online timezone requests when cache hits", async () => {
    let called = 0;
    const restore = setTimezoneOnlineFetcherForTests(async () => {
      called += 1;
      return {
        timezone: "America/New_York",
        utcOffsetMinutes: -240,
        daylightSaving: true,
      };
    });
    await resolveTimezoneOnline({
      latitude: 40.7128,
      longitude: -74.006,
      date: "1990-05-15",
      preferOnline: true,
      fallbackTimezone: "Asia/Shanghai",
    });
    const second = await resolveTimezoneOnline({
      latitude: 40.7128,
      longitude: -74.006,
      date: "1990-05-15",
      preferOnline: true,
      fallbackTimezone: "Asia/Shanghai",
    });
    restore();
    expect(called).toBe(1);
    expect(second.meta.fromCache).toBe(true);
  });
});
