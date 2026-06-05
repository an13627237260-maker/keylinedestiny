import { DateTime } from "luxon";
import type { CalculationStep } from "../shared/types";
import type { BaziInput } from "../shared/validation";
import { baziOptionsSchema } from "../shared/validation";
import {
  getCalibratedSolarTerms,
} from "../dataSources/solarTermProvider";
import {
  resolveLocationOnline,
  resolveLocalChinaLocationForQuery,
} from "../dataSources/locationProvider";
import { resolveTimezoneOnline } from "../dataSources/timezoneProvider";
import { getDataSourceLabel } from "../dataSources/providerStatus";
import type {
  DataSourceMeta,
  ProviderResult,
  ResolvedGeoLocation,
  ResolvedTimezone,
} from "../dataSources/types";
import type {
  SolarTerm,
  SolarTermContext,
} from "./solarTerms";
import { solarTermContextKey } from "./solarTerms";
import { UNKNOWN_CITY, UNKNOWN_PROVINCE } from "../location";

export interface BaziCalibrationContext {
  solarTerms?: ProviderResult<SolarTerm[]>;
  solarTermContext?: SolarTermContext;
  location?: ProviderResult<ResolvedGeoLocation>;
  timezone?: ProviderResult<ResolvedTimezone>;
  calculationSteps: CalculationStep[];
  warnings: string[];
}

function clean(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function offsetForTimezone(timezone: string, date?: string): number {
  const dt = date
    ? DateTime.fromISO(`${date}T12:00:00`, { zone: timezone })
    : DateTime.now().setZone(timezone);
  return dt.isValid ? dt.offset : 480;
}

function manualTimezoneResult(
  timezone: string,
  date?: string,
): ProviderResult<ResolvedTimezone> {
  const isDefaultChina = timezone === "Asia/Shanghai";
  return {
    data: {
      timezone,
      utcOffsetMinutes: offsetForTimezone(timezone, date),
      daylightSaving: false,
    },
    meta: {
      sourceType: isDefaultChina ? "local_builtin" : "user_manual",
      providerName: isDefaultChina ? "默认 Asia/Shanghai" : "用户选择时区",
      confidence: "high",
      fallbackUsed: false,
      requestedOnline: false,
      notes: [isDefaultChina ? "使用中国默认时区。" : "使用用户选择的 IANA 时区。"],
    },
    warnings: [],
  };
}

function buildLocationQuery(input: BaziInput): {
  query?: string;
  country?: string;
  isOverseasQuery: boolean;
} {
  const options = baziOptionsSchema.parse(input.options ?? {});
  const overseasQuery = clean(options.overseasLocationQuery);
  const overseasCountry = clean(options.overseasCountry);
  if (overseasQuery) {
    return {
      query: overseasQuery,
      country: overseasCountry,
      isOverseasQuery: true,
    };
  }

  if (
    input.province &&
    input.city &&
    input.province !== UNKNOWN_PROVINCE &&
    input.city !== UNKNOWN_CITY
  ) {
    return {
      query: `${input.province}${input.city}`,
      country: "中国",
      isOverseasQuery: false,
    };
  }

  const birthPlace = clean(input.birthPlace) ?? clean(input.birthPlaceNote);
  if (birthPlace) {
    return {
      query: birthPlace,
      country: overseasCountry,
      isOverseasQuery: Boolean(overseasCountry),
    };
  }

  return { isOverseasQuery: false };
}

function getManualCoordinates(input: BaziInput): {
  latitude?: number;
  longitude?: number;
} {
  return {
    latitude: input.manualLatitude ?? input.latitude,
    longitude: input.manualLongitude ?? input.longitude,
  };
}

function getCoordinatesForTimezone(
  input: BaziInput,
  location?: ProviderResult<ResolvedGeoLocation>,
): { latitude?: number; longitude?: number } {
  const manual = getManualCoordinates(input);
  if (manual.latitude !== undefined && manual.longitude !== undefined) return manual;
  if (
    location?.data.latitude !== undefined &&
    location.data.longitude !== undefined &&
    !location.data.requiresManualCoordinates
  ) {
    return {
      latitude: location.data.latitude,
      longitude: location.data.longitude,
    };
  }
  return {};
}

function coordinateRecord(location?: ResolvedGeoLocation): Record<string, unknown> | null {
  if (!location || location.latitude === undefined || location.longitude === undefined) {
    return null;
  }
  return {
    name: location.name,
    latitude: Number(location.latitude.toFixed(4)),
    longitude: Number(location.longitude.toFixed(4)),
    timezone: location.timezone ?? null,
  };
}

function buildLocationCalibrationStep(
  input: BaziInput,
  location: ProviderResult<ResolvedGeoLocation> | undefined,
  queryInfo: ReturnType<typeof buildLocationQuery>,
): CalculationStep {
  const local = queryInfo.query
    ? resolveLocalChinaLocationForQuery(queryInfo.query, queryInfo.country)
    : null;
  const manual = getManualCoordinates(input);
  const finalCoordinates =
    manual.latitude !== undefined && manual.longitude !== undefined
      ? {
          source: "user_manual",
          latitude: manual.latitude,
          longitude: manual.longitude,
        }
      : location?.data.latitude !== undefined && location.data.longitude !== undefined
        ? {
            source: location.meta.sourceType,
            latitude: location.data.latitude,
            longitude: location.data.longitude,
          }
        : {
            source: "unavailable",
            requiresManualCoordinates: location?.data.requiresManualCoordinates ?? true,
          };

  return {
    step: "location_calibration",
    title: "出生地坐标校准",
    input: {
      query: queryInfo.query ?? null,
      country: queryInfo.country ?? null,
      province: input.province ?? null,
      city: input.city ?? null,
      preferOnline: Boolean(
        baziOptionsSchema.parse(input.options ?? {}).useOnlineLocationCalibration ||
          queryInfo.isOverseasQuery,
      ),
    },
    method:
      "中国城市优先使用内置省市表；开启联网或输入海外地点时，仅发送地点文本与国家信息做 geocoding；失败则保留本地或手动坐标。",
    result: {
      localCoordinates: coordinateRecord(local ?? undefined),
      onlineCoordinates:
        location?.meta.sourceType === "online_verified"
          ? coordinateRecord(location.data)
          : null,
      finalCoordinates,
      dataSource: location ? getDataSourceLabel(location.meta) : "未查询地点",
      providerName: location?.meta.providerName ?? null,
      requestedOnline: location?.meta.requestedOnline ?? false,
      fromCache: location?.meta.fromCache ?? false,
      "是否使用回退": location?.meta.fallbackUsed ?? false,
    },
    notes: [...(location?.meta.notes ?? []), ...(location?.warnings ?? [])],
  };
}

function buildTimezoneCalibrationStep(
  timezone: ProviderResult<ResolvedTimezone>,
  coordinates: { latitude?: number; longitude?: number },
): CalculationStep {
  return {
    step: "timezone_calibration",
    title: "时区校准",
    input: {
      latitude: coordinates.latitude ?? null,
      longitude: coordinates.longitude ?? null,
    },
    method:
      "中国城市默认 Asia/Shanghai；海外或开启联网校准时按经纬度解析 IANA timezone，失败则使用用户选择或默认时区。",
    result: {
      timezone: timezone.data.timezone,
      utcOffsetMinutes: timezone.data.utcOffsetMinutes,
      daylightSaving: timezone.data.daylightSaving ?? null,
      dataSource: getDataSourceLabel(timezone.meta),
      providerName: timezone.meta.providerName,
      requestedOnline: timezone.meta.requestedOnline ?? false,
      fromCache: timezone.meta.fromCache ?? false,
      "是否使用回退": timezone.meta.fallbackUsed,
    },
    notes: [...timezone.meta.notes, ...timezone.warnings],
  };
}

function buildSolarTermContext(
  year: number,
  timezone: string,
  result: ProviderResult<SolarTerm[]>,
): SolarTermContext {
  const key = solarTermContextKey(year, timezone);
  return {
    termsByYear: { [key]: result.data },
    metaByYear: { [key]: result.meta },
  };
}

function mergeWarnings(...items: Array<string[] | undefined>): string[] {
  return [...new Set(items.flatMap((item) => item ?? []))];
}

export async function calibrateBaziDataSources(
  input: BaziInput,
): Promise<BaziCalibrationContext> {
  const options = baziOptionsSchema.parse(input.options ?? {});
  const birthYear = Number(input.birthDate.slice(0, 4));

  const queryInfo = buildLocationQuery(input);
  const shouldResolveLocation = Boolean(queryInfo.query);
  const location = shouldResolveLocation
    ? await resolveLocationOnline({
        query: queryInfo.query!,
        country: queryInfo.country,
        preferOnline:
          options.useOnlineLocationCalibration || queryInfo.isOverseasQuery,
      })
    : undefined;

  const coordinates = getCoordinatesForTimezone(input, location);
  const shouldResolveTimezoneOnline =
    options.useOnlineLocationCalibration || queryInfo.isOverseasQuery;
  const timezone =
    coordinates.latitude !== undefined && coordinates.longitude !== undefined
      ? await resolveTimezoneOnline({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          date: input.birthDate,
          preferOnline: shouldResolveTimezoneOnline,
          fallbackTimezone: input.timezone,
        })
      : manualTimezoneResult(input.timezone, input.birthDate);

  const solarTerms = await getCalibratedSolarTerms({
    year: birthYear,
    timezone: timezone.data.timezone,
    preferOnline: options.useOnlineSolarTermCalibration,
  });

  const calculationSteps: CalculationStep[] = [
    buildLocationCalibrationStep(input, location, queryInfo),
    buildTimezoneCalibrationStep(timezone, coordinates),
  ];

  return {
    solarTerms,
    solarTermContext: buildSolarTermContext(
      birthYear,
      timezone.data.timezone,
      solarTerms,
    ),
    location,
    timezone,
    calculationSteps,
    warnings: mergeWarnings(
      solarTerms.warnings,
      location?.warnings,
      timezone.warnings,
    ),
  };
}

export function buildCalibrationMetaNote(meta?: DataSourceMeta): string {
  if (!meta) return "未使用校准数据。";
  return `${getDataSourceLabel(meta)} · ${meta.providerName}`;
}
