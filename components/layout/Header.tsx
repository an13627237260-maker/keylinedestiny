"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/theme";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const desktopNav = NAV_ITEMS.filter((n) => n.href !== "/");

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-[var(--border-soft)] bg-[rgba(8,6,17,0.85)] backdrop-blur-xl shadow-lg shadow-black/20"
          : "border-b border-transparent bg-transparent",
      )}
      style={{ height: "var(--header-height)" }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)]">
            <Sparkles className="h-4 w-4 text-[var(--gold-main)] transition-transform group-hover:rotate-12" />
            <span className="absolute inset-0 rounded-full border border-[var(--border-purple)] opacity-50" />
          </span>
          <div className="hidden sm:block">
            <p className="font-display text-sm font-semibold tracking-wide text-[var(--text-main)]">
              Keyline Destiny
            </p>
            <p className="text-[10px] text-[var(--text-dim)]">命理星盘</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {desktopNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-[rgba(139,92,246,0.15)] text-[var(--gold-soft)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
