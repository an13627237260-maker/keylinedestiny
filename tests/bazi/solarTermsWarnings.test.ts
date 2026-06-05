import { describe, expect, it } from "vitest";
import { DateTime } from "luxon";
import {
  buildSolarTermStep,
  checkSolarTermProximityWarnings,
  getSolarTermPrecisionMeta,
} from "@/lib/fortune/bazi/solarTerms";

describe("solar term warnings", () => {
  it("calculation_steps 明确标记近似算法来源", () => {
    const dt = DateTime.fromISO("1990-05-15T10:30:00", { zone: "Asia/Shanghai" });
    const step = buildSolarTermStep(1990, "Asia/Shanghai", dt);
    expect(step.result.source).toBe("approx");
    expect(step.result.precision).toBe("approximate");
    expect(step.result.tableAvailable).toBe(false);
    expect(step.result.sourceType).toBe("approx_algorithm");
    expect(JSON.stringify(step)).toContain("近似算法");
    expect(JSON.stringify(step.result)).not.toContain('"exact"');
  });

  it("未内置完整表时 precision=approximate 且 source 不显示 exact", () => {
    const meta = getSolarTermPrecisionMeta(2026);
    expect(meta.source).toBe("approx");
    expect(meta.precision).toBe("approximate");
    expect(meta.tableAvailable).toBe(false);
    expect(meta.note).toContain("当前未内置完整表");
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
        warning.includes("出生时间非常接近节气切换，年柱或月柱建议使用权威天文历节气时刻复核。"),
      ),
    ).toBe(true);
  });
});
