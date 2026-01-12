// src/app/(auth)/login/actions.ts

"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type AuthState = {
  error?: string | null;
  info?: string | null;
};

export async function authAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const mode = String(formData.get("mode") ?? "signin"); // "signin" | "signup"
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !password) {
    return { error: "Please enter an email and password." };
  }

  const supabase = await createSupabaseServerClient();

  if (mode === "signup") {
    if (password.length < 6) {
      return { error: "Password must be at least 6 characters." };
    }
    if (password !== confirmPassword) {
      return { error: "Passwords do not match." };
    }

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) return { error: error.message };

    // If email confirmation is ON, user may not be "signed in" yet.
    // Still show info and keep them on the page.
    return {
      info:
        "Account created. Please check your email to confirm before signing in.",
      error: null,
    };
  }

  // signin
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  // redirect on the server after cookie is set
  redirect("/home");

  // TS appeasement (unreachable)
  return { error: null, info: null };
}