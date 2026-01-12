"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

async function requireUserId() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);
  if (!data.user) redirect("/login");

  return { supabase, userId: data.user.id };
}

export async function getMyBalances() {
  const { supabase, userId } = await requireUserId();

  const { data, error } = await supabase
    .from("balances")
    .select("swipes_remaining, dining_points, convenience_points, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return (
    data ?? {
      swipes_remaining: 0,
      dining_points: 0,
      convenience_points: 0,
      updated_at: null,
    }
  );
}

export async function spendPoints(formData: FormData) {
  const { supabase, userId } = await requireUserId();

  const type = String(formData.get("type") ?? "");
  const amountStr = String(formData.get("amount") ?? "");
  const note = String(formData.get("note") ?? "");
  const direction = String(formData.get("direction") ?? "spend"); // "spend" | "add"

  if (!["dining", "convenience", "swipe"].includes(type)) {
    throw new Error("Invalid type");
  }

  const raw = Number(amountStr);
  if (!Number.isFinite(raw) || raw <= 0) {
    throw new Error("Amount must be positive");
  }

  const normalized = type === "swipe" ? Math.round(raw) : raw;
  const amount = direction === "add" ? normalized : -normalized;

  const { error } = await supabase.from("transactions").insert({
    user_id: userId,
    type,
    amount,
    source: "manual",
    note: note || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/home");
}