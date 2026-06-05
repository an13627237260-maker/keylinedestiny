"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Layers, Star, Heart, History } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", icon: Home, label: "首页" },
  { href: "/bazi", icon: Sparkles, label: "八字" },
  { href: "/tarot", icon: Layers, label: "塔罗" },
  { href: "/zodiac", icon: Star, label: "星座" },
  { href: "/reports", icon: History, label: "历史" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-soft)] bg-[rgba(8,6,17,0.92)] backdrop-blur-xl md:hidden"
      style={{ height: "var(--mobile-nav-height)" }}
    >
      <div className="flex h-full items-center justify-around px-2">
        {ITEMS.map(({ href, icon: Icon, label }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition-colors",
                active ? "text-[var(--gold-main)]" : "text-[var(--text-dim)]",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.6} />
              <span>{label}</span>
            </Link>
          );
        })}
        <Link
          href="/name"
          className={cn(
            "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]",
            pathname.startsWith("/name") || pathname.startsWith("/love")
              ? "text-[var(--gold-main)]"
              : "text-[var(--text-dim)]",
          )}
        >
          <Heart className="h-5 w-5" strokeWidth={1.6} />
          <span>更多</span>
        </Link>
      </div>
    </nav>
  );
}
