// src/app/(app)/calendar/actions.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";

export type MealLog = {
  id: string;
  date_key: string;
  location: string;
  meal: string;
  item_id: string;
  item_title: string;
  station: string | null;
  calories: number | null;
  created_at: string;
};

export type LogActionState = { error: string | null };

export async function logMealAction(
  _prev: LogActionState,
  formData: FormData
): Promise<LogActionState> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { error: "Not signed in." };

    const date_key = String(formData.get("date_key") ?? "");
    const location = String(formData.get("location") ?? "");
    const meal = String(formData.get("meal") ?? "");
    const item_id = String(formData.get("item_id") ?? "");
    const item_title = String(formData.get("item_title") ?? "");
    const stationRaw = String(formData.get("station") ?? "");
    const caloriesRaw = String(formData.get("calories") ?? "");

    const station = stationRaw.trim() ? stationRaw.trim() : null;
    const calories =
      caloriesRaw === "" ? null : Number.isFinite(Number(caloriesRaw)) ? Number(caloriesRaw) : null;

    const { error } = await supabase.from("meal_logs").insert({
      user_id: authData.user.id,
      date_key,
      location,
      meal,
      item_id,
      item_title,
      station,
      calories,
    });

    if (error) return { error: error.message };
    return { error: null };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to log meal." };
  }
}

export async function getMealLogsForDay(date_key: string): Promise<MealLog[]> {
  const supabase = await createSupabaseServerClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return [];

  const { data, error } = await supabase
    .from("meal_logs")
    .select("id,date_key,location,meal,item_id,item_title,station,calories,created_at")
    .eq("user_id", authData.user.id)
    .eq("date_key", date_key)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as MealLog[];
}
// // src/app/(app)/calendar/actions.ts

// "use server";

// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
// import { createSupabaseServerClient } from "@/lib/supabaseServer";

// export async function logMealTransaction(formData: FormData) {
//   const supabase = await createSupabaseServerClient();

//   const { data: authData } = await supabase.auth.getUser();
//   if (!authData?.user) redirect("/login");

//   const locationLabel = String(formData.get("locationLabel") ?? "");
//   const dateStr = String(formData.get("dateStr") ?? "");
//   const meal = String(formData.get("meal") ?? "");
//   const itemTitle = String(formData.get("itemTitle") ?? "");
//   const calories = Number(formData.get("calories") ?? 0);
//   const estimatedDiningDollars = Number(formData.get("estimatedDiningDollars") ?? 0);

//   // spending -> negative
//   const amount = -Math.abs(estimatedDiningDollars || 0);

//   const note = `Meal log (mock): ${locationLabel} • ${dateStr} • ${meal} • ${itemTitle} • ${calories} cals`;

//   const { error } = await supabase.from("transactions").insert({
//     user_id: authData.user.id,
//     type: "dining",
//     amount,
//     source: "meal_log_mock",
//     note,
//   });

//   if (error) throw new Error(error.message);

//   revalidatePath("/calendar");
// }