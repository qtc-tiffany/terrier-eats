// src/app/(app)/analytics/SpendingChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type Tab = "dining" | "convenience";

type ChartPoint = {
  date: string; // YYYY-MM-DD
  dining: number;
  convenience: number;
};

function formatTick(dateKey: string) {
  // dateKey is YYYY-MM-DD
  const d = new Date(dateKey + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
}

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function SpendingChart({ data, tab }: { data: ChartPoint[]; tab: Tab }) {
  const today = todayKey();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tickFormatter={formatTick}
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 10 }} width={34} />
        <Tooltip
          // Recharts tooltip values may be number | string | undefined.
          // Always coerce safely before formatting.
          formatter={(value: number | string | undefined) => {
            const n = typeof value === "number" ? value : Number(value);
            return money(Number.isFinite(n) ? n : 0);
          }}
          labelFormatter={(label) => `Date: ${label}`}
        />

        {/* "Today" marker */}
        <ReferenceLine x={today} stroke="rgba(0,0,0,0.35)" strokeDasharray="3 3" />

        {/* The key fix: tab is a union ("dining" | "convenience"), so this is type-safe */}
        <Line type="monotone" dataKey={tab} stroke="#CC0000" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}