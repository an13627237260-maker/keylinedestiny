import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function MysticButton({
  children,
  variant = "primary",
  loading,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
}) {
  const { type = "button", ...rest } = props;

  return (
    <button
      type={type}
      disabled={loading || rest.disabled}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-300 disabled:opacity-50",
        variant === "primary" &&
          "border border-[var(--border-soft)] bg-gradient-to-r from-[var(--purple-deep)] to-[var(--purple-primary)] text-[var(--text-main)] shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_28px_rgba(214,181,109,0.25)] hover:brightness-110",
        variant === "secondary" &&
          "glass-card border-[var(--border-purple)] text-[var(--text-muted)] hover:border-[var(--border-soft)] hover:text-[var(--text-main)]",
        variant === "ghost" &&
          "text-[var(--text-muted)] hover:bg-[rgba(139,92,246,0.08)] hover:text-[var(--text-main)]",
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
