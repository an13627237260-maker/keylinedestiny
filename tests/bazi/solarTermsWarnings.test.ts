import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import {
  buildSolarTermStep,
  checkSolarTermProximityWarnings,
} from "@/lib/fortune/bazi/solarTerms";

describe("solar term warnings", () => {
  it("calculation_steps 明确标记近似算法来源", () => {
    const dt = DateTime.fromISO("1990-05-15T10:30:00", { zone: "Asia/Shanghai" });
    const step = buildSolarTermStep(1990, "Asia/Shanghai", dt);
    expect(step.result.sourceType).toBe("approx_algorithm");
    expect(JSON.stringify(step)).toContain("近似算法");
  });

  it("距离节气 24 小时以内给出边界 warning", () => {
    const dt = DateTime.fromISO("1984-02-05T10:00:00", { zone: "Asia/Shanghai" });
    const warnings = checkSolarTermProximityWarnings(dt, "Asia/Shanghai");
    expect(warnings.some((warning) => warning.includes("不足 24 小时"))).toBe(true);
  });

  it("距离节气 2 小时以内给出强提示", () => {
    const dt = DateTime.fromISO("1984-02-04T15:30:00", { zone: "Asia/Shanghai" });
    const warnings = checkSolarTermProximityWarnings(dt, "Asia/Shanghai");
    expect(
      warnings.some((warning) =>
        warning.includes("出生时间非常接近节气切换，年柱或月柱建议使用精确节气表复核。"),
      ),
    ).toBe(true);
  });
});
