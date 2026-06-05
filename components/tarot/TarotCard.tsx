"use client";

import { motion } from "framer-motion";

export function TarotCardUI({
  name,
  position,
  upright,
  revealed = true,
}: {
  name?: string;
  position?: string;
  upright?: boolean;
  revealed?: boolean;
}) {
  return (
    <motion.div
      className="relative mx-auto aspect-[2/3] w-full max-w-[140px]"
      initial={revealed ? { rotateY: 180 } : { rotateY: 0 }}
      animate={{ rotateY: revealed ? 0 : 0 }}
      transition={{ duration: 0.6 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 p-3 text-center ${
          revealed
            ? "border-[var(--gold-main)]/50 bg-[var(--bg-card-solid)]"
            : "border-[var(--purple-primary)]/40 bg-gradient-to-br from-[var(--purple-deep)] to-[var(--bg-deep)]"
        }`}
      >
        {!revealed ? (
          <>
            <div
              className="mb-2 h-16 w-16 rounded-full opacity-30"
              style={{
                background: "conic-gradient(var(--gold-main), transparent, var(--purple-primary))",
              }}
            />
            <span className="text-[10px] tracking-widest text-[var(--purple-soft)]">星盘</span>
          </>
        ) : (
          <>
            {position && (
              <p className="mb-2 text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
                {position}
              </p>
            )}
            <p className="font-display text-sm font-semibold text-[var(--gold-soft)]">{name}</p>
            <p
              className={`mt-2 rounded-full px-2 py-0.5 text-[10px] ${
                upright
                  ? "bg-[rgba(109,214,160,0.12)] text-[var(--success)]"
                  : "bg-[rgba(224,107,107,0.12)] text-[var(--danger)]"
              }`}
            >
              {upright ? "正位" : "逆位"}
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
