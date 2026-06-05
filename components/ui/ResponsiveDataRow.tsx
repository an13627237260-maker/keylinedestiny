import { cn } from "@/lib/utils";

export function ResponsiveDataRow({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 border-b border-[var(--border-soft)] py-2.5 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className,
      )}
    >
      <dt className="text-xs text-[var(--text-dim)]">{label}</dt>
      <dd className="text-sm text-[var(--text-muted)] break-words">{value}</dd>
    </div>
  );
}
