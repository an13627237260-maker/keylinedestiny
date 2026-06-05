import { cn } from "@/lib/utils";

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  centered,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(centered && "text-center", className)}>
      {eyebrow && (
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--gold-main)]">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-2xl font-semibold text-[var(--text-main)] md:text-3xl">
        {title}
      </h2>
      <div className={cn("gold-line", centered && "mx-auto")} />
      {subtitle && (
        <p className={cn("mt-4 max-w-2xl text-sm text-[var(--text-muted)]", centered && "mx-auto")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
