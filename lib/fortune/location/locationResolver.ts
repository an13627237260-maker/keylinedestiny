import type { CalculationStep } from "../shared/types";
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
}

export function resolveBirthLocation(
  input: BirthLocationInput,
): ResolvedBirthLocation {
  const notes: string[] = [];
  const birthPlaceNote = input.birthPlaceNote?.trim() || undefined;

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
      notes: [
        "未选择出生地，未使用真太阳时修正。",
        "四柱仍以输入的出生时间与节气规则计算。",
      ],
      birthPlaceNote,
    };
  }

  const manualLon = input.manualLongitude ?? input.longitude;
  const manualLat = input.manualLatitude ?? input.latitude;

  if (manualLon !== undefined) {
    const province = input.province ?? UNKNOWN_PROVINCE;
    const city = input.city ?? "手动坐标";
    const cityEntry =
      input.province && input.city
        ? getCityEntry(input.province, input.city)
        : undefined;

    notes.push("使用手动输入经纬度优先于城市默认值。");
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
      timezone: "Asia/Shanghai",
      region: cityEntry?.region,
      climateTags: cityEntry?.climateTags ?? [],
      elementBias: cityEntry?.elementBias,
      locationConfidence: "manual",
      notes,
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
        notes: [entry.notes],
        birthPlaceNote,
      };
    }
    notes.push(`未在数据库中找到 ${input.province}${input.city}，尝试使用省会坐标。`);
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
      "从内置中国省市数据解析经纬度、时区与地域五行气候倾向；手动经纬度优先",
    result: {
      latitude: resolved.latitude ?? null,
      longitude: resolved.longitude ?? null,
      timezone: resolved.timezone,
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
