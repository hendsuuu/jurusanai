import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CurrencyText({
  value,
  className,
  fallback = "-",
}: {
  value: number | null | undefined;
  className?: string;
  fallback?: string;
}) {
  if (value == null) return <span className={className}>{fallback}</span>;
  return <span className={cn("tabular-nums", className)}>{formatCurrency(value)}</span>;
}
