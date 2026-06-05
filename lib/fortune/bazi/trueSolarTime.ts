import { DateTime } from "luxon";
import type { CalculationStep } from "../shared/types";
import { CHINA_STANDARD_LONGITUDE } from "../location/regionElements";
import type { DataSourceMeta } from "../dataSources/types";
import { getDataSourceLabel } from "../dataSources/providerStatus";

export interface TrueSolarTimeResult {
  originalDateTime: DateTime;
  adjustedDateTime: DateTime;
  timezone: string;
  longitude: number;
  standardLongitude: number;
  correctionMinutes: number;
  useEquationOfTime: boolean;
  utcOffsetMinutes?: number;
  longitudeSource?: DataSourceMeta;
  timezoneSource?: DataSourceMeta;
}

function resolveStandardLongitude(
  timezone: string,
  localDateTime: DateTime,
  utcOffsetMinutes?: number,
): number {
  if (timezone === "Asia/Shanghai") {
    return CHINA_STANDARD_LONGITUDE;
  }
  const offsetMinutes = utcOffsetMinutes ?? localDateTime.setZone(timezone).offset;
  if (!Number.isFinite(offsetMinutes)) return CHINA_STANDARD_LONGITUDE;
  return (offsetMinutes / 60) * 15;
}

export function calculateTrueSolarTime(
  localDateTime: DateTime,
  timezone: string,
  longitude: number,
  useEquationOfTime = false,
  calibration?: {
    utcOffsetMinutes?: number;
    longitudeSource?: DataSourceMeta;
    timezoneSource?: DataSourceMeta;
  },
): TrueSolarTimeResult {
  const standardLongitude = resolveStandardLongitude(
    timezone,
    localDateTime,
    calibration?.utcOffsetMinutes,
  );
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
    utcOffsetMinutes: calibration?.utcOffsetMinutes,
    longitudeSource: calibration?.longitudeSource,
    timezoneSource: calibration?.timezoneSource,
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
      longitudeSource: result.longitudeSource
        ? getDataSourceLabel(result.longitudeSource)
        : "出生地经度",
      timezoneSource: result.timezoneSource
        ? getDataSourceLabel(result.timezoneSource)
        : "输入时区",
    },
    method:
      "中国使用标准经度 120°E；海外使用时区 UTC offset × 15 得到标准经度；修正分钟 = (出生地经度 - 标准经度) × 4",
    result: {
      standardLongitude: result.standardLongitude,
      correctionMinutes: Number(result.correctionMinutes.toFixed(2)),
      trueSolarTime: result.adjustedDateTime.toISO(),
      useEquationOfTime: result.useEquationOfTime,
      hourPillarChanged: impact?.hourPillarChanged ?? false,
      dayPillarChanged: impact?.dayPillarChanged ?? false,
      crossedHourBranch: impact?.hourPillarChanged ?? false,
      crossedDate: !result.originalDateTime.hasSame(result.adjustedDateTime, "day"),
      utcOffsetMinutes: result.utcOffsetMinutes ?? null,
    },
    notes: [
      result.longitudeSource
        ? `经度来源：${getDataSourceLabel(result.longitudeSource)}。`
        : "经度来源：出生地解析结果。",
      result.timezoneSource
        ? `时区来源：${getDataSourceLabel(result.timezoneSource)}。`
        : "时区来源：用户输入或本地默认。",
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
