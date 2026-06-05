"use client";

import { motion } from "framer-motion";
import type {
  TarotCardDefinition,
  TarotOrientation,
  TarotSpreadPosition,
  TarotSuit,
} from "@/lib/fortune/tarot";
import { cn } from "@/lib/utils";

const SUIT_LABELS: Record<TarotSuit, string> = {
  major: "大阿尔卡那",
  wands: "权杖",
  cups: "圣杯",
  swords: "宝剑",
  pentacles: "星币",
};

export function TarotCardUI({
  card,
  orientation = "upright",
  position,
  revealed = true,
  name,
  upright,
}: {
  card?: TarotCardDefinition;
  orientation?: TarotOrientation;
  position?: TarotSpreadPosition | string;
  revealed?: boolean;
  name?: string;
  upright?: boolean;
}) {
  const resolvedOrientation: TarotOrientation =
    upright === undefined ? orientation : upright ? "upright" : "reversed";
  const positionName = typeof position === "string" ? position : position?.name;
  const displayName = card?.nameCn ?? name ?? "塔罗牌";
  const displayEn = card?.nameEn ?? "Tarot Card";
  const suitLabel = card ? SUIT_LABELS[card.suit] : "牌背";

  return (
    <motion.div
      className="relative mx-auto aspect-[2/3] w-full max-w-[168px] min-w-0"
      initial={revealed ? { opacity: 0, y: 8 } : { opacity: 1 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-between rounded-xl border-2 p-3 text-center shadow-[0_12px_30px_rgba(0,0,0,0.18)]",
          revealed
            ? "border-[var(--gold-main)]/50 bg-[var(--bg-card-solid)]"
            : "border-[var(--purple-primary)]/40 bg-gradient-to-br from-[var(--purple-deep)] to-[var(--bg-deep)]",
        )}
      >
        {!revealed ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div
              className="mb-3 h-16 w-16 rounded-full opacity-30"
              style={{
                background: "conic-gradient(var(--gold-main), transparent, var(--purple-primary))",
              }}
            />
            <span className="text-[10px] tracking-widest text-[var(--purple-soft)]">TAROT</span>
          </div>
        ) : (
          <>
            <div>
              {positionName && (
                <p className="mb-2 text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
                  {positionName}
                </p>
              )}
              <p className="break-words font-display text-base font-semibold text-[var(--gold-soft)]">
                {displayName}
              </p>
              <p className="mt-1 break-words text-[10px] leading-relaxed text-[var(--text-dim)]">
                {displayEn}
              </p>
            </div>

            <div className="mx-auto my-3 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[rgba(139,92,246,0.08)] text-[10px] text-[var(--purple-soft)]">
              {suitLabel}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px]",
                  resolvedOrientation === "upright"
                    ? "bg-[rgba(109,214,160,0.12)] text-[var(--success)]"
                    : "bg-[rgba(224,107,107,0.12)] text-[var(--danger)]",
                )}
              >
                {resolvedOrientation === "upright" ? "正位" : "逆位"}
              </span>
              <span className="rounded-full bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[10px] text-[var(--text-dim)]">
                {suitLabel}
              </span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
