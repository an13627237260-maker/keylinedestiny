import { Sparkles } from "lucide-react";
import { MysticCard } from "@/components/ui/mystic-card";

export function EmptyBaziState() {
  return (
    <MysticCard className="relative min-h-[320px] overflow-hidden">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="mb-6 h-32 w-32 rounded-full opacity-[0.08]"
          style={{
            background: "conic-gradient(from 0deg, var(--gold-main), var(--purple-primary), var(--gold-main))",
            animation: "wheel-spin 60s linear infinite",
          }}
        />
        <Sparkles className="mb-4 h-8 w-8 text-[var(--gold-main)]/60" />
        <p className="font-display text-lg text-[var(--text-muted)]">
          填写出生信息后，系统会在这里生成命盘结构
        </p>
        <p className="mt-2 max-w-sm text-xs text-[var(--text-dim)]">
          节气校准 · 四柱排盘 · 五行十神 · 大运流年 · 规则引擎报告
        </p>
      </div>
    </MysticCard>
  );
}
