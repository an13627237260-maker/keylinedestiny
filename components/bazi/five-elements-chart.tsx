"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS: Record<string, string> = {
  木: "#22c55e",
  火: "#ef4444",
  土: "#eab308",
  金: "#94a3b8",
  水: "#3b82f6",
};

export function FiveElementsChart({
  percentages,
}: {
  percentages: Record<string, number>;
}) {
  const data = Object.entries(percentages).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#a1a1aa" />
          <YAxis stroke="#a1a1aa" />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #7c3aed40",
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] ?? "#7c3aed"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
