import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function MysticCard({
  title,
  description,
  icon: Icon,
  children,
  className,
  highlighted,
  headerAction,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  highlighted?: boolean;
  headerAction?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "glass-card group max-w-full rounded-2xl transition-all duration-300 hover:border-[rgba(214,181,109,0.35)] md:rounded-3xl",
        highlighted && "border-[rgba(214,181,109,0.4)] shadow-[0_0_24px_rgba(139,92,246,0.12)]",
        className,
      )}
    >
      {(title || description) && (
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-soft)] px-4 py-3 md:px-5 md:py-4">
          <div className="flex gap-3">
            {Icon && (
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-purple)] bg-[rgba(139,92,246,0.08)]">
                <Icon className="h-4 w-4 text-[var(--gold-main)]" />
              </span>
            )}
            <div>
              {title && (
                <h3 className="font-display text-base font-semibold text-[var(--text-main)]">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">{description}</p>
              )}
            </div>
          </div>
          {headerAction}
        </div>
      )}
      <div className="p-4 md:p-5">{children}</div>
    </div>
  );
}
