"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Dumbbell, Home } from "lucide-react";

const items = [
  { href: "/", label: "开始", icon: Home },
  { href: "/today", label: "今日", icon: Dumbbell },
  { href: "/stats", label: "统计", icon: BarChart3 }
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/login")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.65rem)] pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-4xl grid-cols-3 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`flex min-h-14 flex-col items-center justify-center rounded-2xl text-xs font-semibold transition ${active ? "bg-mint text-leaf" : "text-slate-500 active:bg-slate-100"}`}>
              <Icon aria-hidden className="mb-1 h-5 w-5" strokeWidth={2.4} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
