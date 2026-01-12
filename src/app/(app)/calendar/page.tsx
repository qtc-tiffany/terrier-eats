// src/app/(app)/calendar/page.tsx
"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  getMockMenu,
  type LocationKey,
  type MealKey,
  type MenuItem,
} from "@/data/mockMenus";
import {
  getMealLogsForDay,
  logMealAction,
  type MealLog,
  type LogActionState,
} from "./actions";

const LOCATIONS: { key: LocationKey; label: string; buMenuUrl: string }[] = [
  {
    key: "marciano",
    label: "Marciano Commons",
    buMenuUrl: "https://www.bu.edu/dining/location/marciano/#menu",
  },
  {
    key: "warren",
    label: "Warren Towers",
    buMenuUrl: "https://www.bu.edu/dining/location/warren/#menu",
  },
];

function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ---- Calendar helpers (no extra libs) ----
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function formatMonthYear(d: Date) {
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

const initialActionState: LogActionState = { error: null };

export default function CalendarPage() {
  const [locIndex, setLocIndex] = useState(0);
  const location = LOCATIONS[locIndex];

  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const dateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);

  const [meal, setMeal] = useState<MealKey>("breakfast");

  const menu = useMemo(
    () => getMockMenu(location.key, dateKey),
    [location.key, dateKey]
  );

  const monthStart = startOfMonth(monthCursor);
  const monthEnd = endOfMonth(monthCursor);

  const leadingBlanks = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  function goPrevLocation() {
    setLocIndex((i) => (i - 1 + LOCATIONS.length) % LOCATIONS.length);
  }
  function goNextLocation() {
    setLocIndex((i) => (i + 1) % LOCATIONS.length);
  }

  function goPrevMonth() {
    setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function goNextMonth() {
    setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  function pickDay(day: number) {
    const next = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day);
    setSelectedDate(next);
  }

  // Server action for logging (no try/catch wrapper needed since action returns LogActionState)
  const [actionState, action, isPending] = useActionState(
    logMealAction,
    initialActionState
  );

  // Logged section state
  const [logs, setLogs] = useState<MealLog[]>([]);

  async function refreshLogs(dk = dateKey) {
    const data = await getMealLogsForDay(dk);
    setLogs(data);
  }

  // Auto-refresh when switching day or dining hall
  useEffect(() => {
    let ignore = false;

    (async () => {
      const data = await getMealLogsForDay(dateKey);
      if (!ignore) setLogs(data);
    })();

    return () => {
      ignore = true;
    };
  }, [dateKey, location.key]);

  function renderMenuItem(item: MenuItem) {
    return (
      <div key={item.id} className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-semibold">{item.title}</div>
            {item.station && (
              <div className="text-xs opacity-90">{item.station}</div>
            )}
            {item.macros && (
              <div className="text-xs opacity-90 mt-1">{item.macros}</div>
            )}
          </div>

          <div className="text-right">
            {typeof item.calories === "number" && (
              <div className="text-sm whitespace-nowrap">
                {item.calories} cals
              </div>
            )}

            {/* Logging is allowed multiple times (no disable-after-logged) */}
            <form action={action} className="mt-2">
              <input type="hidden" name="date_key" value={dateKey} />
              <input type="hidden" name="location" value={location.key} />
              <input type="hidden" name="meal" value={meal} />
              <input type="hidden" name="item_id" value={item.id} />
              <input type="hidden" name="item_title" value={item.title} />
              <input
                type="hidden"
                name="station"
                value={item.station ?? ""}
              />
              <input
                type="hidden"
                name="calories"
                value={
                  typeof item.calories === "number" ? String(item.calories) : ""
                }
              />

              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-white/20 px-4 py-2 text-xs font-medium hover:bg-white/25 disabled:opacity-60"
              >
                {isPending ? "Logging..." : "Log"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const totalCalories = logs.reduce((sum, r) => sum + (r.calories ?? 0), 0);

  return (
    <div className="pb-24">
      {/* Location pill */}
      <div className="px-5 pt-6">
        <div className="rounded-2xl bg-red-600 text-white shadow-md h-16 flex items-center justify-center relative">
          <button
            type="button"
            onClick={goPrevLocation}
            className="absolute left-4 text-2xl leading-none px-2"
            aria-label="Previous dining hall"
          >
            ‹
          </button>

          <div className="text-lg font-medium">{location.label}</div>

          <button
            type="button"
            onClick={goNextLocation}
            className="absolute right-4 text-2xl leading-none px-2"
            aria-label="Next dining hall"
          >
            ›
          </button>
        </div>

        <div className="mt-2 text-xs text-neutral-500">
          Menu source: <span className="underline">{location.buMenuUrl}</span>
        </div>
      </div>

      {/* Calendar card */}
      <section className="mt-6 px-5">
        <div className="rounded-3xl border-2 border-red-600 bg-white px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">
              {formatMonthYear(monthCursor)}
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={goPrevMonth}
                className="text-2xl leading-none px-2"
                aria-label="Previous month"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={goNextMonth}
                className="text-2xl leading-none px-2"
                aria-label="Next month"
              >
                ›
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 text-xs text-neutral-300 font-semibold">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
              <div key={d} className="text-center py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-y-3">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`blank-${idx}`} />;

              const date = new Date(
                monthCursor.getFullYear(),
                monthCursor.getMonth(),
                day
              );
              const selected = isSameDay(date, selectedDate);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => pickDay(day)}
                  className="flex justify-center"
                  aria-label={`Select ${date.toDateString()}`}
                >
                  <span
                    className={[
                      "h-10 w-10 flex items-center justify-center text-base",
                      selected
                        ? "rounded-full bg-rose-200 shadow-md"
                        : "rounded-full hover:bg-neutral-100",
                    ].join(" ")}
                  >
                    {day}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Meal + Menu */}
      <section className="mt-6 px-5">
        <div className="rounded-3xl bg-red-600 text-white shadow-md overflow-hidden">
          {/* Tabs row */}
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between text-sm font-medium">
              <button
                type="button"
                onClick={() => setMeal("breakfast")}
                className={[
                  "px-6 py-2 rounded-full transition",
                  meal === "breakfast"
                    ? "bg-white/25 shadow-inner"
                    : "opacity-90",
                ].join(" ")}
              >
                Breakfast
              </button>

              <button
                type="button"
                onClick={() => setMeal("lunch")}
                className={[
                  "px-6 py-2 rounded-full transition",
                  meal === "lunch" ? "bg-white/25 shadow-inner" : "opacity-90",
                ].join(" ")}
              >
                Lunch
              </button>

              <button
                type="button"
                onClick={() => setMeal("dinner")}
                className={[
                  "px-6 py-2 rounded-full transition",
                  meal === "dinner" ? "bg-white/25 shadow-inner" : "opacity-90",
                ].join(" ")}
              >
                Dinner
              </button>
            </div>
          </div>

          {/* Error banner for logging */}
          {actionState?.error && (
            <div className="mx-5 mt-4 rounded-xl bg-white/15 px-4 py-3 text-sm">
              {actionState.error}
            </div>
          )}

          {/* Menu list */}
          <div className="mt-4">
            {menu[meal].map((item, i) => (
              <div key={item.id}>
                {renderMenuItem(item)}
                {i !== menu[meal].length - 1 && (
                  <div className="mx-5 h-px bg-white/35" />
                )}
              </div>
            ))}

            {menu[meal].length === 0 && (
              <div className="px-5 py-10 text-center text-sm opacity-90">
                No items for this date in the mock menu yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Logged today (NO cost) */}
      <section className="mt-6 px-5">
        <div className="rounded-3xl bg-white shadow-md border border-neutral-200">
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-base font-semibold">Logged on {dateKey}</div>
              <div className="text-xs text-neutral-500">
                {logs.length} item{logs.length === 1 ? "" : "s"} • {totalCalories} total cals
              </div>
            </div>

            <button
              type="button"
              onClick={() => refreshLogs(dateKey)}
              className="rounded-full bg-red-600 text-white px-4 py-2 text-xs font-medium shadow-sm"
            >
              Refresh
            </button>
          </div>

          <div className="px-5 pb-4">
            {logs.length === 0 ? (
              <div className="text-sm text-neutral-500 py-6 text-center">
                Nothing logged yet for this day.
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl bg-neutral-50 px-4 py-3 border border-neutral-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold">{r.item_title}</div>
                        <div className="text-xs text-neutral-600">
                          {String(r.meal).toUpperCase()} • {String(r.location)}
                          {r.station ? ` • ${r.station}` : ""}
                        </div>
                      </div>

                      {typeof r.calories === "number" && (
                        <div className="text-sm whitespace-nowrap">{r.calories} cals</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}