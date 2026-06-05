export type DataSourceType =
  | "local_builtin"
  | "online_verified"
  | "approx_algorithm"
  | "user_manual";

export interface DataSourceMeta {
  sourceType: DataSourceType;
  providerName: string;
  fetchedAt?: string;
  confidence: "high" | "medium" | "low";
  fallbackUsed: boolean;
  notes: string[];
  fromCache?: boolean;
  requestedOnline?: boolean;
}

export interface ProviderResult<T> {
  data: T;
  meta: DataSourceMeta;
  warnings: string[];
}

export interface ResolvedGeoLocation {
  name: string;
  country: string;
  province?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  requiresManualCoordinates?: boolean;
}

export interface ResolvedTimezone {
  timezone: string;
  utcOffsetMinutes: number;
  daylightSaving?: boolean;
}

export interface OnlineRequestOptions {
  timeoutMs?: number;
}

export const DEFAULT_ONLINE_TIMEOUT_MS = 5000;
