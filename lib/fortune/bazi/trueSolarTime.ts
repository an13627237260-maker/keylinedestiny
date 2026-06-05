import { DateTime } from "luxon";
import type { CalculationStep } from "../shared/types";
import { CHINA_STANDARD_LONGITUDE } from "../location/regionElements";

export interface TrueSolarTimeResult {
  originalDateTime: DateTime;
  adjustedDateTime: DateTime;
  timezone: string;
  longitude: number;
  standardLongitude: number;
  correctionMinutes: number;
  useEquationOfTime: boolean;
}

function resolveStandardLongitude(timezone: string): number {
  if (timezone === "Asia/Shanghai") {
    return CHINA_STANDARD_LONGITUDE;
  }
  return CHINA_STANDARD_LONGITUDE;
}

export function calculateTrueSolarTime(
  localDateTime: DateTime,
  timezone: string,
  longitude: number,
  useEquationOfTime = false,
): TrueSolarTimeResult {
  const standardLongitude = resolveStandardLongitude(timezone);
  const correctionMinutes = (longitude - standardLongitude) * 4;

  let adjusted = localDateTime.plus({ minutes: correctionMinutes });

  if (useEquationOfTime) {
    // 预留均时差，第一版不启用
  }

  return {
    originalDateTime: localDateTime,
    adjustedDateTime: adjusted,
    timezone,
    longitude,
    standardLongitude,
    correctionMinutes,
    useEquationOfTime,
  };
}

export function buildTrueSolarTimeStep(
  result: TrueSolarTimeResult,
  impact?: { hourPillarChanged: boolean; dayPillarChanged: boolean },
): CalculationStep {
  return {
    step: "true_solar_time",
    title: "真太阳时修正",
    input: {
      original: result.originalDateTime.toISO(),
      timezone: result.timezone,
      longitude: result.longitude,
      cityLabel: "出生地经度",
    },
    method:
      "中国标准时间参考经度 120°E；修正分钟 = (出生地经度 - 120) × 4；偏西则真太阳时更早",
    result: {
      standardLongitude: result.standardLongitude,
      correctionMinutes: Number(result.correctionMinutes.toFixed(2)),
      trueSolarTime: result.adjustedDateTime.toISO(),
      useEquationOfTime: result.useEquationOfTime,
      hourPillarChanged: impact?.hourPillarChanged ?? false,
      dayPillarChanged: impact?.dayPillarChanged ?? false,
    },
    notes: [
      result.correctionMinutes < 0
        ? `真太阳时比北京时间约早 ${Math.abs(Math.round(result.correctionMinutes))} 分钟`
        : result.correctionMinutes > 0
          ? `真太阳时比北京时间约晚 ${Math.round(result.correctionMinutes)} 分钟`
          : "出生地经度接近标准经度，真太阳时与北京时间基本一致",
      impact?.hourPillarChanged
        ? "修正后时柱与原北京时间计算结果不同"
        : "修正后时柱未变化",
      impact?.dayPillarChanged
        ? "修正后日柱与原北京时间计算结果不同"
        : "修正后日柱未变化",
      ...(result.useEquationOfTime
        ? ["已请求均时差，但当前版本尚未实现。"]
        : ["均时差 useEquationOfTime 已保留配置，当前未启用。"]),
    ],
  };
}
