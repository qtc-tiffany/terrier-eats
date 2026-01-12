// src/app/(app)/budget/page.tsx
// Server Component: fetch data securely on the server and pass it to the client UI.

import BudgetClient from "./BudgetClient";
import { getBalances, getBudgetsForRange, getTransactionsForRange } from "./actions";

function toDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfWeekMonday(d: Date) {
  const copy = new Date(d);
  const day = copy.getDay(); // Sun=0..Sat=6
  const diff = (day === 0 ? -6 : 1 - day); // move to Monday
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfWeekSunday(d: Date) {
  const start = startOfWeekMonday(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export default async function BudgetPage() {
  // Current week for the Dining weekly breakdown.
  const today = new Date();
  const weekStart = startOfWeekMonday(today);
  const weekEnd = endOfWeekSunday(today);

  const startDate = toDateKey(weekStart);
  const endDate = toDateKey(weekEnd);

  // ISO range for transactions (occurred_at is timestamptz).
  const startIso = weekStart.toISOString();
  const endIso = weekEnd.toISOString();

  const [balances, budgets, tx] = await Promise.all([
    getBalances(),
    getBudgetsForRange(startDate, endDate),
    getTransactionsForRange(startIso, endIso),
  ]);

  return (
    <BudgetClient
      balances={balances}
      weekStartDate={startDate}
      weekEndDate={endDate}
      budgets={budgets}
      tx={tx}
    />
  );
}