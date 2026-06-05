import { DateTime } from "luxon";
import type { CalculationStep } from "../shared/types";
import { getTimezoneOffsetHours } from "../shared/time";

export interface TrueSolarTimeResult {
  originalDateTime: DateTime;
  adjustedDateTime: DateTime;
  timezone: string;
  longitude: number;
  standardLongitude: number;
  correctionMinutes: number;
  useEquationOfTime: boolean;
}

export function calculateTrueSolarTime(
  localDateTime: DateTime,
  timezone: string,
  longitude: number,
  useEquationOfTime = false,
): TrueSolarTimeResult {
  const offsetHours = getTimezoneOffsetHours(timezone, localDateTime);
  const standardLongitude = offsetHours * 15;
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

export function buildTrueSolarTimeStep(result: TrueSolarTimeResult): CalculationStep {
  return {
    step: "true_solar_time",
    title: "真太阳时修正",
    input: {
      original: result.originalDateTime.toISO(),
      timezone: result.timezone,
      longitude: result.longitude,
    },
    method:
      "标准经度 = 时区偏移(小时) × 15；修正分钟 = (出生地经度 - 标准经度) × 4",
    result: {
      standardLongitude: result.standardLongitude,
      correctionMinutes: result.correctionMinutes,
      trueSolarTime: result.adjustedDateTime.toISO(),
      useEquationOfTime: result.useEquationOfTime,
    },
    notes: result.useEquationOfTime
      ? ["已请求均时差，但当前版本尚未实现。"]
      : ["均时差 useEquationOfTime 已保留配置，当前未启用。"],
  };
}
