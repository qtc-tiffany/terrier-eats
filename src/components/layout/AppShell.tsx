import BottomNav from "@/components/layout/BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-100 flex justify-center">
      {/* Mobile-first container that looks good on desktop */}
      <div className="relative w-full max-w-[430px] bg-white min-h-dvh shadow-sm">
        {/* Page content */}
        <main className="pb-20">{children}</main>

        {/* Bottom navigation */}
        <BottomNav />
      </div>
    </div>
  );
}