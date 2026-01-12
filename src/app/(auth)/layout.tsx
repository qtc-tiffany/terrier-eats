// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-900 flex justify-center">
      {/* phone-sized canvas */}
      <div className="w-full max-w-[430px] min-h-dvh bg-white">
        {children}
      </div>
    </div>
  );
}