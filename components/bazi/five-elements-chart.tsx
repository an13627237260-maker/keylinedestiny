"use client";

import { ElementBarsMobile } from "@/components/bazi/ElementBarsMobile";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const COLORS: Record<string, string> = {
  木: "#2F9E75",
  火: "#C94A4A",
  土: "#C9A227",
  金: "#B8C0CC",
  水: "#3A6EA5",
};

export function FiveElementsChart({
  percentages,
  strongestElement,
  weakestElement,
  balanceScore,
}: {
  percentages: Record<string, number>;
  strongestElement?: string;
  weakestElement?: string;
  balanceScore?: number;
}) {
  const data = Object.entries(percentages)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const sorted = [...data];
  const top = strongestElement ?? sorted[0]?.name;
  const low = weakestElement ?? sorted[sorted.length - 1]?.name;

  return (
    <div className="max-w-full space-y-4 overflow-hidden">
      <ElementBarsMobile
        percentages={percentages}
        strongestElement={strongestElement}
        weakestElement={weakestElement}
        balanceScore={balanceScore}
      />
      <div className="hidden h-72 w-full max-w-full md:block">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#a1a1aa" tick={{ fill: "#d4d4d8" }} />
            <YAxis
              stroke="#a1a1aa"
              domain={[0, 100]}
              tick={{ fill: "#a1a1aa" }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value) => [`${value ?? 0}%`, "占比"]}
              contentStyle={{
                background: "#18181b",
                border: "1px solid #7c3aed40",
                borderRadius: 8,
              }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
              <LabelList
                dataKey="value"
                position="top"
                formatter={(v) => `${v ?? 0}%`}
                fill="#e4e4e7"
                fontSize={12}
              />
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] ?? "#7c3aed"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-2 text-sm text-zinc-300 sm:grid-cols-3">
        <p>
          <span className="text-zinc-500">最旺：</span>
          <span style={{ color: COLORS[top ?? ""] }}>{top}</span>
        </p>
        <p>
          <span className="text-zinc-500">最弱：</span>
          <span style={{ color: COLORS[low ?? ""] }}>{low}</span>
        </p>
        <p>
          <span className="text-zinc-500">平衡度：</span>
          {balanceScore ?? "—"} 分
        </p>
      </div>
      <p className="text-sm leading-relaxed text-zinc-400">
        五行分布反映命局中木火土金水的相对比重，不代表“缺什么就必须补什么”。
        当前最旺的{top}气较突出，行事风格可能更偏向该五行特质；相对偏弱的{low}
        可通过习惯与节奏管理来调和，而非简单判定吉凶。
      </p>
    </div>
  );
}
