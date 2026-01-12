// src/app/(app)/home/page.tsx
import Image from "next/image";
import { getMyBalances, spendPoints } from "./actions";

export default async function HomePage() {
  const balances = await getMyBalances();

  return (
    <div className="pb-24 min-h-dvh flex flex-col">
      {/* Phone-width centered canvas */}
      <div className="mx-auto w-full max-w-[430px] flex-1 flex flex-col">
        {/* Header */}
        <header className="px-6 pt-4">
          <div className="relative flex items-center justify-center">
            {/* Logo left */}
            <div className="absolute left-0">
              <Image
                src="/Rhett_Logo.png"
                alt="Terrier Eats"
                width={40}
                height={40}
                priority
              />
            </div>

            {/* Title */}
            <h1 className="text-xl font-medium">Terrier Eats</h1>
          </div>

          {/* Red divider */}
          <div className="mt-6 h-[2px] w-full bg-red-600" />
        </header>

        {/* Cards — centered as a group */}
        <section className="flex-1 flex flex-col justify-center px-6 space-y-5">
          {/* Swipes */}
          <div className="mx-auto w-full max-w-sm bg-red-600 text-white rounded-2xl px-5 py-4 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">💳</span>
              <span className="text-sm">Swipes</span>
            </div>

            <div className="text-right">
              <div className="text-2xl font-semibold">
                {balances.swipes_remaining}
              </div>
              <div className="text-xs opacity-90">remaining</div>
            </div>
          </div>

          {/* Dining Points */}
          <div className="mx-auto w-full max-w-sm bg-red-600 text-white rounded-2xl px-5 py-4 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">🍴</span>
              <span className="text-sm">Dining Points</span>
            </div>

            <div className="text-right">
              <div className="text-2xl font-semibold">
                ${balances.dining_points.toFixed(2)}
              </div>
              <div className="text-xs opacity-90">available</div>
            </div>
          </div>

          {/* Convenience Points + add button */}
          <div className="mx-auto w-full max-w-sm bg-red-600 text-white rounded-2xl px-5 py-4 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">💲</span>
              <span className="text-sm">Convenience Points</span>
            </div>

            <div className="text-2xl font-semibold">
              ${balances.convenience_points.toFixed(2)}
            </div>
          </div>

          {/* Add convenience points (example: +5) */}
          {/* The button feature is temporarily disabled for now - come back later */}

          {/* 
          <form action={spendPoints} className="mx-auto">
            <input type="hidden" name="type" value="convenience" />
            <input type="hidden" name="amount" value="5" />
            <input type="hidden" name="note" value="Manual top-up" />

            <button
              type="submit"
              className="h-12 w-12 rounded-full bg-red-600 text-white text-2xl shadow-lg flex items-center justify-center"
              aria-label="Add convenience points"
            >
              +
            </button>
          </form> 
          */}
        </section>
      </div>
    </div>
  );
}