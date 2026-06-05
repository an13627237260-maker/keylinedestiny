import Link from "next/link";

const NAV = [
  { href: "/bazi", label: "八字测算" },
  { href: "/tarot", label: "塔罗抽牌" },
  { href: "/zodiac", label: "星座分析" },
  { href: "/name", label: "姓名分析" },
  { href: "/love", label: "情感合盘" },
  { href: "/reports", label: "历史报告" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-violet-500/20 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold text-violet-300">
          命理测算
        </Link>
        <nav className="flex flex-wrap gap-3 text-sm text-zinc-400">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-violet-300 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-violet-950/20 to-zinc-950 text-zinc-100">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
