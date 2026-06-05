import { cn } from "@/lib/utils";

export function MobileSection({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      {(title || description) && (
        <div>
          {title && (
            <h3 className="font-display text-base font-semibold text-[var(--text-main)] md:text-lg">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-[var(--text-dim)] md:text-sm">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
