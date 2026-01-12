// src/app/(auth)/login/page.tsx
"use client";

import Image from "next/image";
import React, { useMemo, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { authAction } from "./actions";

type Mode = "signin" | "signup";

const initialState = { error: null as string | null, info: null as string | null };

function SubmitButton({ mode }: { mode: Mode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-3 h-14 w-[220px] rounded-full bg-[#CC0000] text-white text-lg shadow-sm disabled:opacity-60"
    >
      {pending ? "Working..." : mode === "signup" ? "Sign up" : "Login"}
    </button>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const isSignup = useMemo(() => mode === "signup", [mode]);

  const [state, formAction] = useActionState(authAction, initialState);

  return (
    <div className="min-h-dvh bg-white">
      {/* top section (logo + title) */}
      <div className="flex flex-col items-center pt-16">
        <Image
          src="/Rhett_Logo.png"
          alt="Terrier Eats logo"
          width={180}
          height={180}
          priority
          className="h-auto w-[180px]"
        />

        <h1 className="mt-6 text-[44px] leading-none font-medium text-[#2D2926]">
          Terrier Eats
        </h1>
      </div>

      {/* form section */}
      <form action={formAction} className="mt-10 px-10 flex flex-col items-center gap-5">
        {/* tell the server which mode */}
        <input type="hidden" name="mode" value={mode} />

        <input
          name="email"
          placeholder={isSignup ? "Email" : "Username"} // keep Figma vibe; still posts to email field
          autoComplete="email"
          className="h-14 w-full max-w-[360px] rounded-full bg-[#CC0000] px-6 text-white placeholder-white/90 outline-none
                     focus:ring-2 focus:ring-[#CC0000]/40"
        />

        <input
          name="password"
          placeholder="Password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          className="h-14 w-full max-w-[360px] rounded-full bg-[#CC0000] px-6 text-white placeholder-white/90 outline-none
                     focus:ring-2 focus:ring-[#CC0000]/40"
        />

        {isSignup && (
          <input
            name="confirmPassword"
            placeholder="Confirm Password"
            type="password"
            autoComplete="new-password"
            className="h-14 w-full max-w-[360px] rounded-full bg-[#CC0000] px-6 text-white placeholder-white/90 outline-none
                       focus:ring-2 focus:ring-[#CC0000]/40"
          />
        )}

        {/* error/info (kept minimal; doesn't ruin layout) */}
        {state?.error && (
          <div className="w-full max-w-[360px] rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">
            {state.error}
          </div>
        )}
        {state?.info && (
          <div className="w-full max-w-[360px] rounded-xl bg-blue-50 px-4 py-2 text-sm text-blue-700">
            {state.info}
          </div>
        )}

        <SubmitButton mode={mode} />
      </form>

      {/* optional toggle (small, below, won’t mess with Figma layout) */}
      <div className="mt-6 text-center text-sm text-neutral-700">
        {isSignup ? "Already have an account?" : "Need an account?"}{" "}
        <button
          type="button"
          className="font-medium underline"
          onClick={() => setMode(isSignup ? "signin" : "signup")}
        >
          {isSignup ? "Log in" : "Sign up"}
        </button>
      </div>
    </div>
  );
}