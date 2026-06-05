import type { LuckPeriod } from "./types";

export interface LuckPeriodRange {
  period: LuckPeriod;
  startDate: Date;
  endDate: Date;
  label: string;
  anchorDate: Date;
  dates: Date[];
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return startOfDay(r);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
  const d = addDays(date, offsetWeeks * 7);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = addDays(d, mondayOffset);
  const end = addDays(start, 6);
  return { start, end };
}

function getMonthRange(date: Date, offsetMonths = 0): { start: Date; end: Date } {
  const d = addMonths(date, offsetMonths);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start: startOfDay(start), end: startOfDay(end) };
}

function getYearRange(date: Date, offsetYears = 0): { start: Date; end: Date } {
  const y = date.getFullYear() + offsetYears;
  return {
    start: new Date(y, 0, 1),
    end: new Date(y, 11, 31),
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
    return `${start.getFullYear()}年${start.getMonth() + 1}月`;
  }
  if (offset === 0) return "今年";
  if (offset === -1) return "去年";
  if (offset === 1) return "明年";
  return `${start.getFullYear()}年`;
}

/** 年运采样：每月 15 日 + 年初年末节点 */
function yearSampleDates(start: Date, end: Date): Date[] {
  const y = start.getFullYear();
  const samples = [
    new Date(y, 0, 1),
    new Date(y, 0, 15),
    new Date(y, 1, 15),
    new Date(y, 2, 15),
    new Date(y, 3, 15),
    new Date(y, 4, 15),
    new Date(y, 5, 15),
    new Date(y, 6, 15),
    new Date(y, 7, 15),
    new Date(y, 8, 15),
    new Date(y, 9, 15),
    new Date(y, 10, 15),
    new Date(y, 11, 15),
    new Date(y, 11, 31),
  ];
  return samples.map(startOfDay);
}

/** 月运采样：月初、上旬、月中、下旬、月末 */
function monthSampleDates(start: Date, end: Date): Date[] {
  const y = start.getFullYear();
  const m = start.getMonth();
  const last = end.getDate();
  const mid = Math.floor((1 + last) / 2);
  const early = Math.max(1, Math.floor(last * 0.25));
  const late = Math.min(last, Math.floor(last * 0.75));
  return [
    new Date(y, m, 1),
    new Date(y, m, early),
    new Date(y, m, mid),
    new Date(y, m, late),
    new Date(y, m, last),
  ].map(startOfDay);
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
      anchorDate: new Date(start.getFullYear(), start.getMonth(), 15),
      dates: monthSampleDates(start, end),
      label: buildLabel(period, start, end, offset),
    };
  }

  const { start, end } = getYearRange(base, offset);
  return {
    period,
    startDate: start,
    endDate: end,
    anchorDate: new Date(start.getFullYear(), 6, 1),
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
