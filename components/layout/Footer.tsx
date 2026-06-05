import { DISCLAIMER } from "@/lib/fortune/shared/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border-soft)] bg-[rgba(8,6,17,0.5)] pb-[calc(var(--mobile-nav-height)+1rem)] md:pb-8">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <p className="font-display text-xs text-[var(--gold-main)]/80">Keyline Destiny · 命理星盘</p>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[var(--text-dim)]">
          传统命理规则生成，仅供娱乐与传统文化参考，不构成现实决策依据。
        </p>
        <p className="mt-3 text-[10px] text-[var(--text-dim)]/70">{DISCLAIMER}</p>
      </div>
    </footer>
  );
}
