"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Sparkles,
  Star,
  PenLine,
  Layers,
  Heart,
  MoreHorizontal,
  History,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MAIN_ITEMS = [
  { href: "/bazi", icon: Sparkles, label: "八字" },
  { href: "/zodiac", icon: Star, label: "星座" },
  { href: "/name", icon: PenLine, label: "姓名" },
  { href: "/tarot", icon: Layers, label: "塔罗" },
  { href: "/love", icon: Heart, label: "合盘" },
] as const;

const MORE_ITEMS = [
  { href: "/", icon: Home, label: "首页" },
  { href: "/reports", icon: History, label: "历史" },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive =
    pathname === "/" ||
    pathname.startsWith("/reports") ||
    moreOpen;

  return (
    <>
      {moreOpen && (
        <button
          type="button"
          aria-label="关闭菜单"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {moreOpen && (
        <div className="fixed bottom-[calc(var(--mobile-nav-height)+0.5rem)] right-3 z-50 min-w-[140px] rounded-xl border border-[var(--border-soft)] bg-[rgba(8,6,17,0.95)] p-2 shadow-xl backdrop-blur-xl md:hidden">
          {MORE_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMoreOpen(false)}
              className={cn(
                "flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm",
                pathname === href || (href !== "/" && pathname.startsWith(href))
                  ? "bg-[rgba(139,92,246,0.12)] text-[var(--gold-main)]"
                  : "text-[var(--text-muted)]",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-soft)] bg-[rgba(8,6,17,0.92)] backdrop-blur-xl md:hidden safe-area-pb"
        style={{ height: "var(--mobile-nav-height)" }}
        aria-label="主导航"
      >
        <div className="flex h-full items-stretch justify-around px-1">
          {MAIN_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px] transition-colors",
                  active ? "text-[var(--gold-main)]" : "text-[var(--text-dim)]",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.2 : 1.6} />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px]",
              moreActive ? "text-[var(--gold-main)]" : "text-[var(--text-dim)]",
            )}
          >
            <MoreHorizontal className="h-5 w-5" strokeWidth={moreActive ? 2.2 : 1.6} />
            <span>更多</span>
          </button>
        </div>
      </nav>
    </>
  );
}
