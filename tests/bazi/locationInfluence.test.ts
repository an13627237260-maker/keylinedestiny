import { describe, it, expect } from "vitest";
import { computeBazi } from "@/lib/fortune/bazi";
import { generateLuckOverview } from "@/lib/fortune/luck";
import { LOCATION_LUCK_SCORE_MAX_DELTA } from "@/lib/fortune/location/regionElements";

const BASE = {
  gender: "male" as const,
  birthDate: "1990-05-15",
  birthTime: "10:30",
  timezone: "Asia/Shanghai",
  focusArea: "overall" as const,
};

describe("出生地参与八字与运势", () => {
  it("calculation_steps 包含 location_resolved 和 true_solar_time", () => {
    const { calculation_steps } = computeBazi({
      ...BASE,
      province: "北京市",
      city: "北京市",
      useTrueSolarTime: true,
    });
    expect(calculation_steps.some((s) => s.step === "location_resolved")).toBe(true);
    expect(calculation_steps.some((s) => s.step === "true_solar_time")).toBe(true);
  });

  it("unknown 出生地不启用真太阳时", () => {
    const { algorithm_result, warnings } = computeBazi({
      ...BASE,
      locationUnknown: true,
      useTrueSolarTime: true,
    });
    expect(algorithm_result.locationInfluence?.useTrueSolarTime).toBe(false);
    expect(warnings.some((w) => w.includes("真太阳时"))).toBe(true);
  });

  it("出生地地域五行不改变四柱（同时间不同城市对比日主）", () => {
    const bj = computeBazi({
      ...BASE,
      province: "北京市",
      city: "北京市",
      useTrueSolarTime: false,
    });
    const sh = computeBazi({
      ...BASE,
      province: "上海市",
      city: "上海市",
      useTrueSolarTime: false,
    });
    expect(bj.algorithm_result.pillarStrings).toEqual(sh.algorithm_result.pillarStrings);
    expect(bj.algorithm_result.dayMasterStrength.strengthLevel).toBe(
      sh.algorithm_result.dayMasterStrength.strengthLevel,
    );
  });

  it("地域五行最多影响运势评分 3 分", () => {
    expect(LOCATION_LUCK_SCORE_MAX_DELTA).toBe(3);
    const { algorithm_result } = computeBazi({
      ...BASE,
      province: "新疆维吾尔自治区",
      city: "乌鲁木齐市",
      useTrueSolarTime: true,
    });
    const overview = generateLuckOverview({
      baziResult: algorithm_result,
      period: "day",
    });
    const hasLocationNote = overview.calculationBasis.some((b) =>
      b.includes("地域气候"),
    );
    if (hasLocationNote) {
      const note = overview.calculationBasis.find((b) => b.includes("地域气候"))!;
      const m = note.match(/([+-]\d+) 分/);
      if (m) {
        expect(Math.abs(Number(m[1]))).toBeLessThanOrEqual(3);
      }
    }
  });

  it("切换城市后重新计算（经度不同）", () => {
    const bj = computeBazi({
      ...BASE,
      province: "北京市",
      city: "北京市",
      useTrueSolarTime: true,
    });
    const wlmq = computeBazi({
      ...BASE,
      province: "新疆维吾尔自治区",
      city: "乌鲁木齐市",
      useTrueSolarTime: true,
    });
    expect(bj.algorithm_result.locationInfluence?.correctionMinutes).not.toBe(
      wlmq.algorithm_result.locationInfluence?.correctionMinutes,
    );
  });

  it("结果包含 locationInfluence", () => {
    const { algorithm_result } = computeBazi({
      ...BASE,
      province: "广东省",
      city: "深圳市",
      useTrueSolarTime: true,
    });
    expect(algorithm_result.locationInfluence?.resolved.city).toBe("深圳市");
    expect(algorithm_result.locationInfluence?.resolved.longitude).toBeDefined();
  });
});
