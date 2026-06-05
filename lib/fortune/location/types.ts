export type ChinaRegion =
  | "north"
  | "south"
  | "east"
  | "west"
  | "central"
  | "northeast"
  | "northwest"
  | "southwest"
  | "southeast";

export type AdminType =
  | "municipality"
  | "prefecture_city"
  | "prefecture"
  | "autonomous_prefecture"
  | "league"
  | "special_administrative_region"
  | "taiwan_city_county"
  | "province_level";

export interface ElementBias {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface ChinaCity {
  province: string;
  city: string;
  adminType: AdminType;
  latitude: number;
  longitude: number;
  timezone: "Asia/Shanghai";
  region: ChinaRegion;
  climateTags: string[];
  elementBias: ElementBias;
  notes: string;
}

export interface ChinaProvince {
  name: string;
  shortName?: string;
  provinceType:
    | "province"
    | "municipality"
    | "autonomous_region"
    | "special_administrative_region"
    | "taiwan";
  cities: ChinaCity[];
}

export type LocationConfidence =
  | "exact_city"
  | "province_capital"
  | "manual"
  | "online_verified"
  | "unknown";

export interface ResolvedBirthLocation {
  province: string;
  city: string;
  displayName: string;
  latitude?: number;
  longitude?: number;
  timezone: "Asia/Shanghai" | string;
  region?: ChinaRegion;
  climateTags: string[];
  elementBias?: ElementBias;
  locationConfidence: LocationConfidence;
  dataSource?: DataSourceMeta;
  notes: string[];
  birthPlaceNote?: string;
}

export interface LocationInfluence {
  resolved: ResolvedBirthLocation;
  originalDateTime: string;
  adjustedDateTime: string;
  correctionMinutes?: number;
  standardLongitude?: number;
  useTrueSolarTime: boolean;
  hourPillarChanged: boolean;
  dayPillarChanged: boolean;
  pillarsBeforeCorrection?: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  regionElementNote: string;
}
import type { DataSourceMeta } from "../dataSources/types";
