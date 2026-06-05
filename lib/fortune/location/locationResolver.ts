import type { CalculationStep } from "../shared/types";
import type {
  DataSourceMeta,
  ProviderResult,
  ResolvedGeoLocation,
} from "../dataSources/types";
import { getDataSourceLabel } from "../dataSources/providerStatus";
import {
  getCityEntry,
  getProvinceCapital,
  UNKNOWN_CITY,
  UNKNOWN_PROVINCE,
} from "./chinaAdministrativeDivisions";
import { describeRegionElementBias } from "./regionElements";
import type { ElementBias, ResolvedBirthLocation } from "./types";

export interface BirthLocationInput {
  province?: string;
  city?: string;
  birthPlace?: string;
  birthPlaceNote?: string;
  locationUnknown?: boolean;
  longitude?: number;
  latitude?: number;
  manualLongitude?: number;
  manualLatitude?: number;
  timezone?: string;
}

function localChinaMeta(): DataSourceMeta {
  return {
    sourceType: "local_builtin",
    providerName: "中国内置省市坐标表",
    confidence: "high",
    fallbackUsed: false,
    requestedOnline: false,
    notes: ["中国城市默认使用内置省市坐标表。"],
  };
}

function manualMeta(): DataSourceMeta {
  return {
    sourceType: "user_manual",
    providerName: "用户手动输入经纬度",
    confidence: "medium",
    fallbackUsed: false,
    requestedOnline: false,
    notes: ["使用用户手动输入经纬度。"],
  };
}

function unknownMeta(): DataSourceMeta {
  return {
    sourceType: "local_builtin",
    providerName: "未确定出生地",
    confidence: "low",
    fallbackUsed: false,
    requestedOnline: false,
    notes: ["未获得可用经纬度。"],
  };
}

export function resolveBirthLocation(
  input: BirthLocationInput,
  calibratedLocation?: ProviderResult<ResolvedGeoLocation>,
): ResolvedBirthLocation {
  const notes: string[] = [];
  const birthPlaceNote = input.birthPlaceNote?.trim() || undefined;
  const manualLon = input.manualLongitude ?? input.longitude;
  const manualLat = input.manualLatitude ?? input.latitude;

  if (manualLon !== undefined) {
    const province = input.province ?? UNKNOWN_PROVINCE;
    const city = input.city ?? "手动坐标";
    const cityEntry =
      input.province && input.city
        ? getCityEntry(input.province, input.city)
        : undefined;

    notes.push("使用手动输入经纬度优先于城市默认值或联网校准值。");
    if (cityEntry) {
      notes.push(
        `参考城市 ${input.province}${input.city} 默认坐标 (${cityEntry.longitude}, ${cityEntry.latitude}) 已被覆盖。`,
      );
    }

    return {
      province,
      city,
      displayName:
        input.province && input.city && input.city !== "手动坐标"
          ? `${input.province}${input.city}`
          : input.birthPlace ?? `手动坐标(${manualLon.toFixed(4)}°E)`,
      latitude: manualLat ?? cityEntry?.latitude,
      longitude: manualLon,
      timezone: input.timezone ?? cityEntry?.timezone ?? "Asia/Shanghai",
      region: cityEntry?.region,
      climateTags: cityEntry?.climateTags ?? [],
      elementBias: cityEntry?.elementBias,
      locationConfidence: "manual",
      dataSource: manualMeta(),
      notes,
      birthPlaceNote,
    };
  }

  const calibrated = calibratedLocation?.data;
  if (
    calibrated &&
    !calibrated.requiresManualCoordinates &&
    calibrated.longitude !== undefined &&
    calibrated.latitude !== undefined
  ) {
    const cityEntry =
      input.province && input.city
        ? getCityEntry(input.province, input.city)
        : undefined;
    return {
      province: calibrated.province ?? input.province ?? UNKNOWN_PROVINCE,
      city: calibrated.city ?? input.city ?? calibrated.name,
      displayName: calibrated.name,
      latitude: calibrated.latitude,
      longitude: calibrated.longitude,
      timezone: calibrated.timezone ?? input.timezone ?? "Asia/Shanghai",
      region: cityEntry?.region,
      climateTags: cityEntry?.climateTags ?? [],
      elementBias: cityEntry?.elementBias,
      locationConfidence:
        calibratedLocation.meta.sourceType === "online_verified"
          ? "online_verified"
          : "exact_city",
      dataSource: calibratedLocation.meta,
      notes: [
        ...calibratedLocation.meta.notes,
        ...calibratedLocation.warnings,
        `最终采用坐标：${calibrated.longitude.toFixed(4)}°E，${calibrated.latitude.toFixed(4)}°N。`,
      ],
      birthPlaceNote,
    };
  }

  const isUnknown =
    input.locationUnknown === true ||
    input.province === UNKNOWN_PROVINCE ||
    input.city === UNKNOWN_CITY ||
    (!input.province && !input.city && !input.longitude && !input.manualLongitude);

  if (isUnknown) {
    return {
      province: UNKNOWN_PROVINCE,
      city: UNKNOWN_CITY,
      displayName: "暂不确定",
      timezone: "Asia/Shanghai",
      climateTags: [],
      locationConfidence: "unknown",
      dataSource: calibratedLocation?.meta ?? unknownMeta(),
      notes: [
        "未选择出生地，未使用真太阳时修正。",
        "四柱仍以输入的出生时间与节气规则计算。",
      ],
      birthPlaceNote,
    };
  }

  if (input.province && input.city) {
    const entry = getCityEntry(input.province, input.city);
    if (entry) {
      return {
        province: entry.province,
        city: entry.city,
        displayName: `${entry.province}${entry.city}`,
        latitude: entry.latitude,
        longitude: entry.longitude,
        timezone: entry.timezone,
        region: entry.region,
        climateTags: entry.climateTags,
        elementBias: entry.elementBias,
        locationConfidence: "exact_city",
        dataSource: localChinaMeta(),
        notes: [entry.notes],
        birthPlaceNote,
      };
    }
    notes.push(`未在内置城市表中找到 ${input.province}${input.city}，尝试使用省会坐标。`);
  }

  if (input.province) {
    const capital = getProvinceCapital(input.province);
    if (capital) {
      notes.push(`仅选择省级行政区，使用省会/首府 ${capital.city} 作为近似出生地。`);
      return {
        province: capital.province,
        city: capital.city,
        displayName: `${capital.province}${capital.city}`,
        latitude: capital.latitude,
        longitude: capital.longitude,
        timezone: capital.timezone,
        region: capital.region,
        climateTags: capital.climateTags,
        elementBias: capital.elementBias,
        locationConfidence: "province_capital",
        dataSource: localChinaMeta(),
        notes,
        birthPlaceNote,
      };
    }
  }

  return {
    province: UNKNOWN_PROVINCE,
    city: UNKNOWN_CITY,
    displayName: input.birthPlace ?? "暂不确定",
    timezone: "Asia/Shanghai",
    climateTags: [],
    locationConfidence: "unknown",
    dataSource: calibratedLocation?.meta ?? unknownMeta(),
    notes: ["无法解析出生地，未使用真太阳时修正。"],
    birthPlaceNote,
  };
}

export function buildLocationResolvedStep(
  resolved: ResolvedBirthLocation,
): CalculationStep {
  return {
    step: "location_resolved",
    title: "出生地解析",
    input: {
      province: resolved.province,
      city: resolved.city,
      displayName: resolved.displayName,
    },
    method:
      "从内置中国省市数据、联网校准结果或用户手动坐标解析经纬度与时区；手动经纬度优先",
    result: {
      latitude: resolved.latitude ?? null,
      longitude: resolved.longitude ?? null,
      timezone: resolved.timezone,
      dataSource: resolved.dataSource
        ? getDataSourceLabel(resolved.dataSource)
        : "本地内置数据",
      providerName: resolved.dataSource?.providerName ?? null,
      requestedOnline: resolved.dataSource?.requestedOnline ?? false,
      fromCache: resolved.dataSource?.fromCache ?? false,
      "是否使用回退": resolved.dataSource?.fallbackUsed ?? false,
      region: resolved.region ?? null,
      locationConfidence: resolved.locationConfidence,
      elementBias: resolved.elementBias ?? null,
      climateTags: resolved.climateTags,
    },
    notes: resolved.notes,
  };
}

export function buildRegionElementNote(elementBias?: ElementBias): string {
  if (!elementBias) {
    return "未选择出生地时，不应用地域五行气候辅助分析。";
  }
  return describeRegionElementBias(elementBias);
}
