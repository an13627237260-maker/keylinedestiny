import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import { calculateTrueSolarTime } from "@/lib/fortune/bazi/trueSolarTime";
import { computeFourPillars } from "@/lib/fortune/bazi/pillars";
import { pillarToString } from "@/lib/fortune/bazi/ganzhi";
import { getCityEntry } from "@/lib/fortune/location";

describe("真太阳时与出生地", () => {
  it("乌鲁木齐真太阳时约比北京时间早 129 分钟", () => {
    const wlmq = getCityEntry("新疆维吾尔自治区", "乌鲁木齐市")!;
    const dt = DateTime.fromISO("1990-05-15T12:00", { zone: "Asia/Shanghai" });
    const tst = calculateTrueSolarTime(dt, "Asia/Shanghai", wlmq.longitude);
    expect(tst.standardLongitude).toBe(120);
    expect(tst.correctionMinutes).toBeCloseTo((87.6168 - 120) * 4, 0);
    expect(Math.round(tst.correctionMinutes)).toBeGreaterThanOrEqual(-130);
    expect(Math.round(tst.correctionMinutes)).toBeLessThanOrEqual(-129);
  });

  it("上海修正约 +6 分钟", () => {
    const sh = getCityEntry("上海市", "上海市")!;
    const dt = DateTime.fromISO("1990-05-15T12:00", { zone: "Asia/Shanghai" });
    const tst = calculateTrueSolarTime(dt, "Asia/Shanghai", sh.longitude);
    expect(Math.round(tst.correctionMinutes)).toBe(6);
  });

  it("真太阳时可能改变时柱", () => {
    const wlmq = getCityEntry("新疆维吾尔自治区", "乌鲁木齐市")!;
    const dt = DateTime.fromISO("1990-05-15T23:30", { zone: "Asia/Shanghai" });
    const before = computeFourPillars(dt, "Asia/Shanghai", {
      dayBoundaryMode: "midnight",
      solarTermSource: "builtIn",
      useEquationOfTime: false,
      calendarRange: "1900-2100",
    });
    const tst = calculateTrueSolarTime(dt, "Asia/Shanghai", wlmq.longitude);
    const after = computeFourPillars(tst.adjustedDateTime, "Asia/Shanghai", {
      dayBoundaryMode: "midnight",
      solarTermSource: "builtIn",
      useEquationOfTime: false,
      calendarRange: "1900-2100",
    });
    const hourChanged =
      pillarToString(before.pillars.hour) !== pillarToString(after.pillars.hour);
    const dayChanged =
      pillarToString(before.pillars.day) !== pillarToString(after.pillars.day);
    expect(hourChanged || dayChanged).toBe(true);
  });
});
