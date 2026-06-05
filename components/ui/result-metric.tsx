import { cn } from "@/lib/utils";

export function ResultMetric({
  label,
  value,
  sub,
  accent,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: "gold" | "purple";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-soft)] bg-[rgba(8,6,17,0.4)] p-4",
        className,
      )}
    >
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">{label}</p>
      <p
        className={cn(
          "mt-1 font-display text-xl font-semibold",
          accent === "gold" && "text-[var(--gold-main)]",
          accent === "purple" && "text-[var(--purple-soft)]",
          !accent && "text-[var(--text-main)]",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-[var(--text-muted)]">{sub}</p>}
    </div>
  );
}
