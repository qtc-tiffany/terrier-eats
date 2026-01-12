// src/app/(app)/analytics/AnalyticsClient.tsx
"use client";

import { useMemo, useState } from "react";
import SpendingChart from "./SpendingChart";
import type { BalanceRow, SpendType, TxRow } from "./actions";

type Tab = Exclude<SpendType, "swipe">; // "dining" | "convenience"

type ChartPoint = {
  date: string; // YYYY-MM-DD
  dining: number; // positive spend
  convenience: number; // positive spend
};

function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatMoney(n: number) {
  return `$${n.toFixed(2)}`;
}

export default function AnalyticsClient({
  balances,
  tx,
  days,
}: {
  balances: BalanceRow;
  tx: TxRow[];
  days: number;
}) {
  const [tab, setTab] = useState<Tab>("dining");

  /**
   * Aggregate tx -> chart points by date.
   * We store spend as positive values on the chart even if transactions are negative.
   */
  const chartData: ChartPoint[] = useMemo(() => {
    // Build a date axis for the last `days` days so the chart is stable.
    const today = new Date();
    const pointsByDate = new Map<string, ChartPoint>();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = toDateKey(d);
      pointsByDate.set(key, { date: key, dining: 0, convenience: 0 });
    }

    for (const t of tx) {
      // Ignore swipes for this screen (different unit)
      if (t.type === "swipe") continue;

      // Important: transactions table uses occurred_at
      const dateKey = toDateKey(new Date(t.occurred_at));
      const p = pointsByDate.get(dateKey);
      if (!p) continue;

      // Convert negative spend into positive magnitude for charting.
      const spend = Math.abs(Number(t.amount) || 0);

      if (t.type === "dining") p.dining += spend;
      if (t.type === "convenience") p.convenience += spend;
    }

    return Array.from(pointsByDate.values());
  }, [tx, days]);

  const totals = useMemo(() => {
    const spentDining = chartData.reduce((sum, r) => sum + r.dining, 0);
    const spentConvenience = chartData.reduce(
      (sum, r) => sum + r.convenience,
      0
    );

    return { spentDining, spentConvenience };
  }, [chartData]);

  const remainingValue =
    tab === "dining" ? balances.dining_points : balances.convenience_points;
  const spentValue = tab === "dining" ? totals.spentDining : totals.spentConvenience;

  return (
    <div className="px-6 pt-8 pb-24">
      {/* Title pill */}
      <div className="flex justify-center">
        <div
          className="w-full max-w-90 rounded-2xl py-4 text-center text-white text-xl shadow-md"
          style={{ backgroundColor: "#CC0000" }}
        >
          Spending Analytics
        </div>
      </div>

      {/* Segmented control */}
      <div className="mt-6 flex justify-center">
        <div className="w-full max-w-85 rounded-2xl bg-[#D9D9D9] p-2 shadow-md">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTab("dining")}
              className="rounded-xl py-2 text-center text-white transition"
              style={{
                backgroundColor: tab === "dining" ? "#CC0000" : "#D9A3A3",
              }}
            >
              Dining
            </button>
            <button
              type="button"
              onClick={() => setTab("convenience")}
              className="rounded-xl py-2 text-center text-white transition"
              style={{
                backgroundColor: tab === "convenience" ? "#CC0000" : "#D9A3A3",
              }}
            >
              Convenience
            </button>
          </div>
        </div>
      </div>

      {/* Chart card */}
      <div className="mt-10 flex justify-center">
        <div className="w-full max-w-95 rounded-2xl bg-[#D9D9D9] p-5 shadow-lg">
          <div className="rounded-xl bg-[#CFCFCF] p-4">
            <div className="w-full overflow-hidden rounded-lg bg-[#DADADA]">
              <div className="h-64 w-full">
                <SpendingChart data={chartData} tab={tab} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="mt-10 space-y-8">
        <MetricCard left={"Remaining\nBalance"} right={formatMoney(remainingValue)} />
        <MetricCard left={"Amount\nSpent"} right={formatMoney(spentValue)} />
      </div>
    </div>
  );
}

function MetricCard({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-65 rounded-2xl bg-[#D9D9D9] px-6 py-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-black text-lg leading-tight whitespace-pre-line">
            {left}
          </div>
          <div className="text-black text-lg font-semibold">{right}</div>
        </div>
      </div>
    </div>
  );
}