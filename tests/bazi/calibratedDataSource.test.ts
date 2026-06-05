import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { computeBazi } from "@/lib/fortune/bazi";
import { calibrateBaziDataSources } from "@/lib/fortune/bazi/calibratedDataSource";
import { setLocationOnlineFetcherForTests } from "@/lib/fortune/dataSources/locationProvider";
import { setTimezoneOnlineFetcherForTests } from "@/lib/fortune/dataSources/timezoneProvider";

describe("bazi calibrated data sources", () => {
  let restoreLocation: (() => void) | undefined;
  let restoreTimezone: (() => void) | undefined;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    restoreLocation?.();
    restoreTimezone?.();
    restoreLocation = undefined;
    restoreTimezone = undefined;
  });

  it("uses the final adopted longitude in true solar time", async () => {
    restoreLocation = setLocationOnlineFetcherForTests(async () => ({
      name: "New York, United States",
      country: "United States",
      city: "New York",
      latitude: 40.7128,
      longitude: -74.006,
    }));
    restoreTimezone = setTimezoneOnlineFetcherForTests(async () => ({
      timezone: "America/New_York",
      utcOffsetMinutes: -240,
      daylightSaving: true,
    }));

    const input = {
      gender: "unknown" as const,
      birthDate: "1990-05-15",
      birthTime: "10:30",
      province: "暂不确定",
      city: "暂不确定",
      locationUnknown: true,
      timezone: "Asia/Shanghai",
      useTrueSolarTime: true,
      focusArea: "overall" as const,
      options: {
        dayBoundaryMode: "midnight" as const,
        solarTermSource: "builtIn" as const,
        useEquationOfTime: false,
        calendarRange: "1900-2100",
        useOnlineSolarTermCalibration: false,
        useOnlineLocationCalibration: false,
        overseasCountry: "US",
        overseasLocationQuery: "New York",
      },
    };

    const calibration = await calibrateBaziDataSources(input);
    const result = computeBazi(input, calibration);
    const loc = result.algorithm_result.locationInfluence;

    expect(loc?.resolved.locationConfidence).toBe("online_verified");
    expect(loc?.resolved.longitude).toBeCloseTo(-74.006, 3);
    expect(loc?.standardLongitude).toBe(-60);
    expect(loc?.correctionMinutes).toBeCloseTo((-74.006 + 60) * 4, 2);
  });

  it("writes data source details into calculation_steps", async () => {
    const input = {
      gender: "unknown" as const,
      birthDate: "1990-05-15",
      birthTime: "10:30",
      province: "北京市",
      city: "北京市",
      timezone: "Asia/Shanghai",
      useTrueSolarTime: true,
      focusArea: "overall" as const,
      options: {
        dayBoundaryMode: "midnight" as const,
        solarTermSource: "builtIn" as const,
        useEquationOfTime: false,
        calendarRange: "1900-2100",
        useOnlineSolarTermCalibration: false,
        useOnlineLocationCalibration: false,
      },
    };

    const calibration = await calibrateBaziDataSources(input);
    const result = computeBazi(input, calibration);
    const stepNames = result.calculation_steps.map((step) => step.step);

    expect(stepNames).toContain("location_calibration");
    expect(stepNames).toContain("timezone_calibration");
    expect(stepNames).toContain("solar_terms");
    expect(
      result.calculation_steps.some((step) =>
        JSON.stringify(step.result).includes("dataSource"),
      ),
    ).toBe(true);
  });
});
