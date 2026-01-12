"use client";

import { useRouter } from "next/navigation";

type Row = {
  label: string;
  icon: string; // emoji placeholder (swap to real icons later)
  onClick?: () => void;
};

export default function ProfilePage() {
  const router = useRouter();

  const rows: Row[] = [
    { label: "Account", icon: "👤" },
    { label: "Notifications", icon: "🔔" },
    { label: "Appearance", icon: "☀️" },
    { label: "Payment Methods", icon: "💳" },
    { label: "Settings", icon: "⚙️" },
  ];

  function onLogout() {
    // TEMP skeleton behavior:
    // Later: Supabase signOut() then redirect.
    router.push("/login");
  }

  return (
    <div className="pb-24">
      {/* Top profile header */}
      <div className="px-6 pt-10">
        <div className="flex items-center gap-6">
          {/* Avatar circle */}
          <div className="h-36 w-36 rounded-full bg-red-600 flex items-center justify-center">
            {/* icon placeholder */}
            <span className="text-white text-5xl">👤</span>
          </div>

          {/* Name + ID */}
          <div className="leading-tight">
            <div className="text-2xl font-medium text-neutral-900">
              Rhett the Terrier
            </div>
            <div className="text-xl text-neutral-900">U12345678</div>
          </div>
        </div>
      </div>

      {/* Settings card */}
      <div className="mt-8 px-6">
        <div className="rounded-3xl bg-red-600 text-white shadow-xl overflow-hidden">
          {rows.map((row, idx) => (
            <button
              key={row.label}
              type="button"
              onClick={row.onClick}
              className={[
                "w-full px-6 py-7 flex items-center gap-5 text-left",
                "active:opacity-95",
              ].join(" ")}
            >
              {/* Left icon */}
              <span className="text-2xl w-8 flex justify-center">
                {row.icon}
              </span>

              {/* Label */}
              <span className="text-xl font-medium">{row.label}</span>

              {/* Divider line (except last) */}
              {idx !== rows.length - 1 && (
                <span className="pointer-events-none absolute" />
              )}

              {/* Actual divider below row */}
              {idx !== rows.length - 1 && (
                <div className="absolute left-0 right-0 translate-y-[3.35rem] h-px bg-white/70" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Logout button */}
      <div className="mt-10 flex justify-center px-6">
        <button
          type="button"
          onClick={onLogout}
          className="h-14 w-[220px] rounded-full bg-red-600 text-white text-lg shadow-md active:scale-[0.99]"
        >
          Logout
        </button>
      </div>
    </div>
  );
}