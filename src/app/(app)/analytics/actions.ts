// src/app/(app)/analytics/actions.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";

export type SpendType = "dining" | "convenience" | "swipe";

export type BalanceRow = {
  swipes_remaining: number;
  dining_points: number;
  convenience_points: number;
  updated_at: string;
};

export type TxRow = {
  id: string;
  occurred_at: string; // matches your Supabase column name
  type: SpendType;
  amount: number; // negative for spend in your current pattern
  note: string | null;
  source: string | null;
};

/**
 * Runtime guard so we can safely narrow the "type" field coming back from Supabase
 * (Supabase returns strings, TypeScript will not trust them automatically).
 */
function isSpendType(v: unknown): v is SpendType {
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

/**
 * Pull last N days of transactions.
 * Note: your table uses occurred_at (not created_at).
 */
export async function getRecentSpendingTx(days: number): Promise<TxRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data: authData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw new Error(userErr.message);
  if (!authData?.user) throw new Error("Not signed in.");

  const start = new Date();
  start.setDate(start.getDate() - Math.max(1, days));
  const startIso = start.toISOString();

  const { data, error } = await supabase
    .from("transactions")
    .select("id, occurred_at, type, amount, note, source")
    .eq("user_id", authData.user.id)
    .gte("occurred_at", startIso)
    .order("occurred_at", { ascending: true });

  if (error) throw new Error(error.message);

  // Validate + cast type, and coerce amount to number
  const rows = (data ?? []).flatMap((r: unknown) => {
    const row = r as Record<string, unknown>;

    const type = row.type;
    if (!isSpendType(type)) return [];

    return [
      {
        id: String(row.id ?? ""),
        occurred_at: String(row.occurred_at ?? ""),
        type,
        amount: Number(row.amount ?? 0),
        note: row.note == null ? null : String(row.note),
        source: row.source == null ? null : String(row.source),
      } satisfies TxRow,
    ];
  });

  return rows;
}