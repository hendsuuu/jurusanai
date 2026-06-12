import { cn } from "@/lib/utils";

export function WizardProgress({
  current,
  total,
  className,
}: {
  current: number;
  total: number;
  className?: string;
}) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-[11px] sm:text-xs text-white/70">
        <span>
          Langkah{" "}
          <span className="font-semibold text-white">
            {current}
          </span>{" "}
          dari {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
      >
        <div
          className="h-full bg-[#C9A24E] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
