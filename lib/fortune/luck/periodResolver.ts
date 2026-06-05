import { DateTime } from "luxon";
import type { LuckPeriod } from "./types";

const TIMEZONE = "Asia/Shanghai";

export interface LuckPeriodRange {
  period: LuckPeriod;
  startDate: Date;
  endDate: Date;
  label: string;
  anchorDate: Date;
  dates: Date[];
}

function startOfDay(d: Date): Date {
  return DateTime.fromJSDate(d).setZone(TIMEZONE).startOf("day").toJSDate();
}

function addDays(d: Date, n: number): Date {
  return DateTime.fromJSDate(d)
    .setZone(TIMEZONE)
    .plus({ days: n })
    .startOf("day")
    .toJSDate();
}

function addMonths(d: Date, n: number): Date {
  return DateTime.fromJSDate(d)
    .setZone(TIMEZONE)
    .plus({ months: n })
    .startOf("month")
    .toJSDate();
}

export function formatDate(d: Date): string {
  return DateTime.fromJSDate(d).setZone(TIMEZONE).toFormat("yyyy-MM-dd");
}

function enumerateDays(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let cur = start;
  while (cur <= end) {
    days.push(new Date(cur));
    cur = addDays(cur, 1);
  }
  return days;
}

function getWeekRange(date: Date, offsetWeeks = 0): { start: Date; end: Date } {
  const d = DateTime.fromJSDate(addDays(date, offsetWeeks * 7)).setZone(TIMEZONE);
  const start = d.minus({ days: d.weekday - 1 }).startOf("day").toJSDate();
  const end = addDays(start, 6);
  return { start, end };
}

function getMonthRange(date: Date, offsetMonths = 0): { start: Date; end: Date } {
  const d = DateTime.fromJSDate(addMonths(date, offsetMonths)).setZone(TIMEZONE);
  return {
    start: d.startOf("month").toJSDate(),
    end: d.endOf("month").startOf("day").toJSDate(),
  };
}

function getYearRange(date: Date, offsetYears = 0): { start: Date; end: Date } {
  const y = DateTime.fromJSDate(date).setZone(TIMEZONE).year + offsetYears;
  return {
    start: DateTime.fromObject({ year: y, month: 1, day: 1 }, { zone: TIMEZONE }).toJSDate(),
    end: DateTime.fromObject({ year: y, month: 12, day: 31 }, { zone: TIMEZONE }).toJSDate(),
  };
}

function buildLabel(
  period: LuckPeriod,
  start: Date,
  end: Date,
  offset: number,
): string {
  const today = startOfDay(new Date());
  if (period === "day") {
    if (formatDate(start) === formatDate(today)) return "今天";
    return formatDate(start);
  }
  if (period === "week") {
    if (offset === 0) return "本周";
    if (offset === -1) return "上周";
    if (offset === 1) return "下周";
    return `${formatDate(start).slice(5)} - ${formatDate(end).slice(5)}`;
  }
  if (period === "month") {
    if (offset === 0) return "本月";
    if (offset === -1) return "上月";
    if (offset === 1) return "下月";
    const dt = DateTime.fromJSDate(start).setZone(TIMEZONE);
    return `${dt.year}年${dt.month}月`;
  }
  if (offset === 0) return "今年";
  if (offset === -1) return "去年";
  if (offset === 1) return "明年";
  return `${DateTime.fromJSDate(start).setZone(TIMEZONE).year}年`;
}

/** 年运采样：每月 15 日 + 年初年末节点 */
function yearSampleDates(start: Date, end: Date): Date[] {
  const y = DateTime.fromJSDate(start).setZone(TIMEZONE).year;
  const samples = [
    [1, 1],
    [1, 15],
    [2, 15],
    [3, 15],
    [4, 15],
    [5, 15],
    [6, 15],
    [7, 15],
    [8, 15],
    [9, 15],
    [10, 15],
    [11, 15],
    [12, 15],
    [12, 31],
  ];
  return samples.map(([month, day]) =>
    DateTime.fromObject({ year: y, month, day }, { zone: TIMEZONE }).toJSDate(),
  );
}

/** 月运采样：月初、上旬、月中、下旬、月末 */
function monthSampleDates(start: Date, end: Date): Date[] {
  const startDt = DateTime.fromJSDate(start).setZone(TIMEZONE);
  const endDt = DateTime.fromJSDate(end).setZone(TIMEZONE);
  const y = startDt.year;
  const m = startDt.month;
  const last = endDt.day;
  const mid = Math.floor((1 + last) / 2);
  const early = Math.max(1, Math.floor(last * 0.25));
  const late = Math.min(last, Math.floor(last * 0.75));
  return [1, early, mid, late, last].map((day) =>
    DateTime.fromObject({ year: y, month: m, day }, { zone: TIMEZONE }).toJSDate(),
  );
}

export function resolveLuckPeriodRange(
  targetDate: Date,
  period: LuckPeriod,
  offset = 0,
): LuckPeriodRange {
  const base = startOfDay(targetDate);

  if (period === "day") {
    const d = addDays(base, offset);
    return {
      period,
      startDate: d,
      endDate: d,
      anchorDate: d,
      dates: [d],
      label: buildLabel(period, d, d, offset),
    };
  }

  if (period === "week") {
    const { start, end } = getWeekRange(base, offset);
    return {
      period,
      startDate: start,
      endDate: end,
      anchorDate: start,
      dates: enumerateDays(start, end),
      label: buildLabel(period, start, end, offset),
    };
  }

  if (period === "month") {
    const { start, end } = getMonthRange(base, offset);
    return {
      period,
      startDate: start,
      endDate: end,
      anchorDate: DateTime.fromJSDate(start)
        .setZone(TIMEZONE)
        .set({ day: 15 })
        .toJSDate(),
      dates: monthSampleDates(start, end),
      label: buildLabel(period, start, end, offset),
    };
  }

  const { start, end } = getYearRange(base, offset);
  return {
    period,
    startDate: start,
    endDate: end,
    anchorDate: DateTime.fromJSDate(start)
      .setZone(TIMEZONE)
      .set({ month: 7, day: 1 })
      .toJSDate(),
    dates: yearSampleDates(start, end),
    label: buildLabel(period, start, end, offset),
  };
}

/** @deprecated use resolveLuckPeriodRange */
export function getPeriodRange(
  period: LuckPeriod,
  targetDate: Date,
  offset = 0,
): { start: Date; end: Date } {
  const r = resolveLuckPeriodRange(targetDate, period, offset);
  return { start: r.startDate, end: r.endDate };
}
