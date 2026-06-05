"use client";

import { cn } from "@/lib/utils";
import type { LuckPeriod } from "@/lib/fortune/luck";

const WEEKDAY_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function getDayOptions(baseDate: Date): { offset: number; label: string; isToday: boolean }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const options: { offset: number; label: string; isToday: boolean }[] = [];

  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + offset);
    const isToday = d.getTime() === today.getTime();
    options.push({
      offset,
      label: isToday ? "今天" : `${WEEKDAY_LABELS[d.getDay()]} ${d.getDate()}`,
      isToday,
    });
  }
  return options;
}

const PERIOD_OPTIONS: Record<
  LuckPeriod,
  { offset: number; label: string }[]
> = {
  day: [],
  week: [
    { offset: -1, label: "上周" },
    { offset: 0, label: "本周" },
    { offset: 1, label: "下周" },
  ],
  month: [
    { offset: -1, label: "上月" },
    { offset: 0, label: "本月" },
    { offset: 1, label: "下月" },
  ],
  year: [
    { offset: -1, label: "去年" },
    { offset: 0, label: "今年" },
    { offset: 1, label: "明年" },
  ],
};

export function LuckTimelineSelector({
  period,
  offset,
  onChange,
  baseDate = new Date(),
  dateRangeLabel,
}: {
  period: LuckPeriod;
  offset: number;
  onChange: (offset: number) => void;
  baseDate?: Date;
  dateRangeLabel?: string;
}) {
  const options =
    period === "day"
      ? getDayOptions(baseDate)
      : PERIOD_OPTIONS[period].map((o) => ({ ...o, isToday: o.offset === 0 }));

  return (
    <div className="mt-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {options.map((opt) => (
          <button
            key={opt.offset}
            type="button"
            onClick={() => onChange(opt.offset)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs transition-all",
              offset === opt.offset
                ? "border border-[rgba(214,181,109,0.45)] bg-[rgba(139,92,246,0.15)] text-[var(--gold-main)] shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                : "border border-transparent text-[var(--text-dim)] hover:text-[var(--text-muted)]",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {dateRangeLabel && period !== "day" && (
        <p className="mt-2 text-[10px] text-[var(--text-dim)]">{dateRangeLabel}</p>
      )}
    </div>
  );
}
