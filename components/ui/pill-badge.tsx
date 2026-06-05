import { cn } from "@/lib/utils";
import { ELEMENT_COLORS } from "@/lib/theme";

export function PillBadge({
  children,
  variant = "default",
  element,
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "gold" | "purple" | "muted";
  element?: string;
  className?: string;
}) {
  const elColor = element ? ELEMENT_COLORS[element] : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "border-[var(--border-purple)] bg-[rgba(139,92,246,0.08)] text-[var(--text-muted)]",
        variant === "gold" && "border-[var(--border-soft)] bg-[rgba(214,181,109,0.08)] text-[var(--gold-soft)]",
        variant === "purple" && "border-[var(--border-purple)] bg-[rgba(139,92,246,0.12)] text-[var(--purple-soft)]",
        variant === "muted" && "border-transparent bg-[rgba(255,255,255,0.04)] text-[var(--text-dim)]",
        className,
      )}
      style={elColor ? { borderColor: `${elColor}44`, color: elColor } : undefined}
    >
      {children}
    </span>
  );
}
