import { DateTime } from "luxon";
import { FortuneError } from "./errors";
import { CALENDAR_MAX_YEAR, CALENDAR_MIN_YEAR } from "./constants";

export function parseBirthDateTime(
  birthDate: string,
  birthTime: string,
  timezone: string,
): DateTime {
  const dt = DateTime.fromISO(`${birthDate}T${birthTime}`, { zone: timezone });
  if (!dt.isValid) {
    throw new FortuneError("INVALID_DATETIME", "出生日期或时间无效", {
      birthDate,
      birthTime,
      timezone,
      reason: dt.invalidReason,
    });
  }
  return dt;
}

export function validateTimezone(timezone: string): void {
  const test = DateTime.now().setZone(timezone);
  if (!test.isValid) {
    throw new FortuneError("INVALID_TIMEZONE", "时区无效", { timezone });
  }
}

export function validateYearInRange(year: number): void {
  if (year < CALENDAR_MIN_YEAR || year > CALENDAR_MAX_YEAR) {
    throw new FortuneError(
      "YEAR_OUT_OF_RANGE",
      `年份必须在 ${CALENDAR_MIN_YEAR}-${CALENDAR_MAX_YEAR} 之间`,
      { year },
    );
  }
}

export function getTimezoneOffsetHours(timezone: string, at: DateTime): number {
  return at.setZone(timezone).offset / 60;
}

export function toGregorianParts(dt: DateTime): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  return {
    year: dt.year,
    month: dt.month,
    day: dt.day,
    hour: dt.hour,
    minute: dt.minute,
  };
}
