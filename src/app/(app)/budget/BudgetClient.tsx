// src/app/(app)/budget/BudgetClient.tsx
"use client";

/**
 * Budget Screen
 * - Dining tab: weekly breakdown (Mon-Sun) with per-day spend and a weekly summary line
 * - Convenience tab: donut remaining points + category limits/spend list
 *
 * Notes:
 * - use balances for remaining points.
 * - use transactions (occurred_at) for spend aggregation.
 * - do not show "cost" in the calendar meal log UI, but budget is about points usage,
 *   so the numbers here represent amounts from the transactions table.
 */

import { useMemo, useState } from "react";
import type { BalanceRow, BudgetRow, TxRow } from "./actions";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

type Tab = "dining" | "convenience";

function parseDateKey(dateKey: string) {
  // dateKey is YYYY-MM-DD
  const [y, m, d] = dateKey.split("-").map((x) => Number(x));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatShortDay(d: Date) {
  return d.toLocaleString(undefined, { weekday: "long" });
}

function formatMonthDay(d: Date) {
  return d.toLocaleString(undefined, { month: "short", day: "numeric" });
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Convenience category detection:
 * If your note starts with "Laundry:", "Grocery:", etc we treat that as the category.
 * Otherwise we fall back to a small default bucket.
 */
function inferCategory(note: string | null) {
  if (!note) return "Other";
  const idx = note.indexOf(":");
  if (idx > 0) return note.slice(0, idx).trim();
  const first = note.trim().split(/\s+/)[0];
  return first ? first : "Other";
}

export default function BudgetClient({
  balances,
  weekStartDate,
  weekEndDate,
  budgets,
  tx,
}: {
  balances: BalanceRow;
  weekStartDate: string; // YYYY-MM-DD
  weekEndDate: string; // YYYY-MM-DD
  budgets: BudgetRow[];
  tx: TxRow[];
}) {
  const [tab, setTab] = useState<Tab>("dining");

  // Build the 7 dates for the week view.
  const weekDays = useMemo(() => {
    const start = parseDateKey(weekStartDate);
    const arr: { date: Date; key: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      arr.push({ date: d, key: toDateKey(d) });
    }
    return arr;
  }, [weekStartDate]);

  // Dining weekly spend by day (positive magnitude).
  const diningSpendByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of weekDays) map.set(d.key, 0);

    for (const t of tx) {
      if (t.type !== "dining") continue;
      const key = toDateKey(new Date(t.occurred_at));
      if (!map.has(key)) continue;

      map.set(key, (map.get(key) ?? 0) + Math.abs(Number(t.amount) || 0));
    }
    return map;
  }, [tx, weekDays]);

  const diningWeeklyTotal = useMemo(() => {
    let sum = 0;
    for (const v of diningSpendByDay.values()) sum += v;
    return sum;
  }, [diningSpendByDay]);

  // Convenience: aggregate spend by inferred category for this week.
  const convenienceByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tx) {
      if (t.type !== "convenience") continue;
      const cat = inferCategory(t.note);
      map.set(cat, (map.get(cat) ?? 0) + Math.abs(Number(t.amount) || 0));
    }
    return Array.from(map.entries())
      .map(([name, spent]) => ({ name, spent }))
      .sort((a, b) => b.spent - a.spent);
  }, [tx]);

  // Try to find a matching budget row (optional, but included for “limits stored in DB”).
  const diningBudget = useMemo(
    () => budgets.find((b) => b.spend_type === "dining" && b.period === "weekly"),
    [budgets]
  );
  const convenienceBudget = useMemo(
    () => budgets.find((b) => b.spend_type === "convenience" && b.period === "weekly"),
    [budgets]
  );

  // Donut chart values for convenience remaining points (from balances).
  const convenienceRemaining = Number(balances.convenience_points || 0);
  const convenienceSpent = clamp(
    convenienceByCategory.reduce((s, r) => s + r.spent, 0),
    0,
    Number.MAX_SAFE_INTEGER
  );

  const donutData = useMemo(() => {
    const remaining = Math.max(0, convenienceRemaining);
    const spent = Math.max(0, convenienceSpent);

    // If everything is 0, draw a small placeholder ring.
    if (remaining === 0 && spent === 0) {
      return [
        { name: "placeholder", value: 1 },
      ];
    }

    return [
      { name: "remaining", value: remaining },
      { name: "spent", value: spent },
    ];
  }, [convenienceRemaining, convenienceSpent]);

  const dateRangeLabel = useMemo(() => {
    const s = parseDateKey(weekStartDate);
    const e = parseDateKey(weekEndDate);
    return `${formatMonthDay(s)} - ${formatMonthDay(e)}`;
  }, [weekStartDate, weekEndDate]);

  return (
    <div className="px-6 pt-8 pb-24">
      {/* Title pill (Figma-style) */}
      <div className="flex justify-center">
        <div className="w-full max-w-[380px] rounded-2xl py-4 text-center text-white text-xl shadow-md bg-[#CC0000]">
          Budget
        </div>
      </div>

      {/* Segmented control (Figma-style) */}
      <div className="mt-6 flex justify-center">
        <div className="w-full max-w-[340px] rounded-2xl bg-[#D9D9D9] p-2 shadow-md">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTab("dining")}
              className="rounded-xl py-2 text-center text-white transition"
              style={{ backgroundColor: tab === "dining" ? "#CC0000" : "#D9A3A3" }}
            >
              Dining
            </button>
            <button
              type="button"
              onClick={() => setTab("convenience")}
              className="rounded-xl py-2 text-center text-white transition"
              style={{ backgroundColor: tab === "convenience" ? "#CC0000" : "#D9A3A3" }}
            >
              Convenience
            </button>
          </div>
        </div>
      </div>

      {tab === "dining" ? (
        <>
          {/* Weekly breakdown list */}
          <div className="mt-10 space-y-4">
            {weekDays.map((d) => {
              const spent = diningSpendByDay.get(d.key) ?? 0;

              return (
                <div key={d.key} className="flex justify-center">
                  <div className="w-full max-w-[380px] flex items-center gap-4">
                    {/* Big left card */}
                    <div className="flex-1 rounded-xl bg-[#D9D9D9] px-4 py-3 shadow-md">
                      <div className="text-sm text-black/80 leading-tight">
                        {formatShortDay(d.date)}
                      </div>
                      <div className="text-sm text-black/70 leading-tight">
                        {formatMonthDay(d.date)}
                      </div>
                    </div>

                    {/* Small right pill (number) */}
                    <div className="w-14 rounded-xl bg-[#D9D9D9] py-4 text-center shadow-md">
                      <div className="text-sm font-semibold text-black/80">
                        {Math.round(spent)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom summary bar */}
          <div className="mt-10 flex justify-center">
            <div className="w-full max-w-[380px] rounded-xl bg-[#D9D9D9] px-4 py-3 text-center shadow-md">
              <div className="text-sm text-[#CC0000] font-medium">
                Swipes Available for Week: {balances.swipes_remaining}
              </div>

              {/* Optional: weekly dining budget summary */}
              {diningBudget && (
                <div className="mt-1 text-xs text-black/60">
                  Weekly dining limit: {Number(diningBudget.total_limit).toFixed(0)} • Spent this week:{" "}
                  {diningWeeklyTotal.toFixed(0)}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Donut chart card */}
          <div className="mt-10 flex justify-center">
            <div className="w-full max-w-[380px] rounded-2xl bg-white shadow-md border border-neutral-200 px-6 py-6">
              <div className="flex justify-center">
                {/* Fixed height prevents the Recharts width/height -1 warning */}
                <div className="h-56 w-56 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        dataKey="value"
                        innerRadius={78}
                        outerRadius={96}
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                      >
                        {/* red = remaining, light red = spent */}
                        <Cell fill="#CC0000" />
                        <Cell fill="#F2B8B8" />
                        <Cell fill="#F2B8B8" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-3xl font-semibold text-black">
                      {Math.round(Math.max(0, convenienceRemaining))} pts
                    </div>
                    <div className="text-sm text-black/70">remaining</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex justify-center">
                <div className="text-sm font-semibold text-black">{dateRangeLabel}</div>
              </div>
              <div className="mt-2 flex justify-center">
                <div className="h-1 w-32 rounded-full bg-black/20" />
              </div>

              {/* Optional: weekly convenience limit if created one */}
              {convenienceBudget && (
                <div className="mt-4 text-center text-xs text-black/60">
                  Weekly convenience limit: {Number(convenienceBudget.total_limit).toFixed(0)} • Spent this week:{" "}
                  {convenienceSpent.toFixed(0)}
                </div>
              )}
            </div>
          </div>

          {/* Category list */}
          <div className="mt-8 space-y-4">
            {(convenienceByCategory.length ? convenienceByCategory : [
              { name: "Laundry", spent: 0 },
              { name: "Grocery", spent: 0 },
              { name: "Food", spent: 0 },
              { name: "Shopping", spent: 0 },
            ]).map((row) => (
              <div key={row.name} className="flex justify-center">
                <div className="w-full max-w-[380px] rounded-xl bg-white shadow-md border border-neutral-200 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-black">{row.name}</div>
                    <div className="text-lg font-semibold text-black">
                      -{Math.round(row.spent)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}