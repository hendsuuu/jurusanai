import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold text-slate-900 truncate">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-slate-500">{hint}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="text-brand-600 shrink-0" aria-hidden>
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
