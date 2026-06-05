import { cn } from "@/lib/utils";

export function MobileMetricGrid({
  items,
  columns = 2,
}: {
  items: { label: string; value: string | number; highlight?: boolean }[];
  columns?: 2 | 3 | 5;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3",
        columns === 5 && "grid-cols-2 sm:grid-cols-5",
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "rounded-xl border px-3 py-3 text-center",
            item.highlight
              ? "border-[var(--gold-main)]/40 bg-[rgba(214,181,109,0.06)]"
              : "border-[var(--border-soft)] bg-[rgba(8,6,17,0.4)]",
          )}
        >
          <p className="text-[10px] text-[var(--text-dim)]">{item.label}</p>
          <p className="mt-1 font-display text-xl font-bold text-[var(--gold-main)]">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
