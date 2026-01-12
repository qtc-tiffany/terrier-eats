"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/home", label: "Home" },
  { href: "/calendar", label: "Calendar" },
  { href: "/analytics", label: "Analytics" },
  { href: "/budget", label: "Budget" },
  { href: "/profile", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="
        absolute bottom-0 left-0 right-0
        z-50
        border-t
        bg-red-600
        text-white
        safe-bottom
      "
    >
      <div className="mx-auto grid max-w-[430px] grid-cols-5">
        {items.map((item) => {
          // handles /home and /home/anything
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                py-3 text-center text-xs
                transition
                ${active ? "font-semibold" : "opacity-80"}
              `}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}