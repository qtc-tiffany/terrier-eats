// src/app/(app)/budget/actions.ts
"use server";

/**
 * Budget screen data access.
 * - Pulls budgets + category limits from DB
 * - Pulls transactions for a given date range (occurred_at)
 *
 * Notes:
 * - The transactions table uses occurred_at (not created_at).
 * - Amount is negative for spend, so UI converts spend to positive magnitude.
 */

import { createSupabaseServerClient } from "@/lib/supabaseServer";

export type SpendType = "dining" | "convenience";

export type BalanceRow = {
  swipes_remaining: number;
  dining_points: number;
  convenience_points: number;
  updated_at: string;
};

export type BudgetRow = {
  id: string;
  user_id: string;
  spend_type: SpendType;
  period: "weekly" | "monthly";
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  total_limit: number;
  created_at: string;
};

export type BudgetCategoryRow = {
  id: string;
  budget_id: string;
  name: string;
  limit_amount: number;
  created_at: string;
};

export type TxRow = {
  id: string;
  type: SpendType | "swipe";
  amount: number;
  note: string | null;
  source: string | null;
  occurred_at: string;
};

function isSpendType(v: unknown): v is SpendType {
  return v === "dining" || v === "convenience";
}
function isTxType(v: unknown): v is TxRow["type"] {
  return v === "dining" || v === "convenience" || v === "swipe";
}

export async function getBalances(): Promise<BalanceRow> {
  const supabase = await createSupabaseServerClient();

  const { data: authData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  if (!authData?.user) throw new Error("Not signed in.");

  const { data, error } = await supabase
    .from("balances")
    .select("swipes_remaining, dining_points, convenience_points, updated_at")
    .eq("user_id", authData.user.id)
    .single();

  if (error) throw new Error(error.message);
  return data as BalanceRow;
}

export async function getBudgetsForRange(
  startDate: string,
  endDate: string
): Promise<BudgetRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data: authData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  if (!authData?.user) throw new Error("Not signed in.");

  // Pull budgets that overlap the given range.
  const { data, error } = await supabase
    .from("budgets")
    .select("id,user_id,spend_type,period,start_date,end_date,total_limit,created_at")
    .eq("user_id", authData.user.id)
    .lte("start_date", endDate)
    .gte("end_date", startDate)
    .order("start_date", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data ?? []).flatMap((r: unknown) => {
    const row = r as Record<string, unknown>;
    const spend_type = row.spend_type;
    const period = row.period;

    if (!isSpendType(spend_type)) return [];
    if (period !== "weekly" && period !== "monthly") return [];

    return [
      {
        id: String(row.id ?? ""),
        user_id: String(row.user_id ?? ""),
        spend_type,
        period,
        start_date: String(row.start_date ?? ""),
        end_date: String(row.end_date ?? ""),
        total_limit: Number(row.total_limit ?? 0),
        created_at: String(row.created_at ?? ""),
      } satisfies BudgetRow,
    ];
  });

  return rows;
}

export async function getBudgetCategories(budgetId: string): Promise<BudgetCategoryRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data: authData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  if (!authData?.user) throw new Error("Not signed in.");

  const { data, error } = await supabase
    .from("budget_categories")
    .select("id,budget_id,name,limit_amount,created_at")
    .eq("budget_id", budgetId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data ?? []).map((r: unknown) => {
    const row = r as Record<string, unknown>;
    return {
      id: String(row.id ?? ""),
      budget_id: String(row.budget_id ?? ""),
      name: String(row.name ?? ""),
      limit_amount: Number(row.limit_amount ?? 0),
      created_at: String(row.created_at ?? ""),
    } satisfies BudgetCategoryRow;
  });

  return rows;
}

export async function getTransactionsForRange(
  startIso: string,
  endIso: string
): Promise<TxRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data: authData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  if (!authData?.user) throw new Error("Not signed in.");

  const { data, error } = await supabase
    .from("transactions")
    .select("id,type,amount,note,source,occurred_at")
    .eq("user_id", authData.user.id)
    .gte("occurred_at", startIso)
    .lte("occurred_at", endIso)
    .order("occurred_at", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data ?? []).flatMap((r: unknown) => {
    const row = r as Record<string, unknown>;
    const type = row.type;

    if (!isTxType(type)) return [];

    return [
      {
        id: String(row.id ?? ""),
        type,
        amount: Number(row.amount ?? 0),
        note: row.note == null ? null : String(row.note),
        source: row.source == null ? null : String(row.source),
        occurred_at: String(row.occurred_at ?? ""),
      } satisfies TxRow,
    ];
  });

  return rows;
}