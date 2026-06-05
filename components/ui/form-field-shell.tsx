import { cn } from "@/lib/utils";

export function FormFieldShell({
  label,
  htmlFor,
  description,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-xs font-medium text-[var(--text-muted)]">
        {label}
      </label>
      {children}
      {description && !error && (
        <p className="text-[10px] text-[var(--text-dim)]">{description}</p>
      )}
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
