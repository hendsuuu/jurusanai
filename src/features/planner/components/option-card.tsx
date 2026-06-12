"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function OptionCard({
  label,
  description,
  selected,
  onClick,
  multi = false,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group text-left w-full rounded-2xl border px-4 py-3.5 transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24E]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#4B5320]",
        selected
          ? "border-[#C9A24E] bg-white/15 ring-1 ring-[#C9A24E] backdrop-blur-sm"
          : "border-white/20 bg-white/8 hover:bg-white/12 hover:border-white/30 backdrop-blur-sm"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "shrink-0 w-5 h-5 mt-0.5 rounded-full border flex items-center justify-center transition-colors",
            selected
              ? "border-[#C9A24E] bg-[#C9A24E] text-[#2A311A]"
              : "border-white/40 bg-white/10 text-transparent"
          )}
          aria-hidden
        >
          {multi ? (
            <Check className="w-3 h-3" />
          ) : (
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                selected ? "bg-[#2A311A]" : "bg-transparent"
              )}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-semibold leading-snug",
              selected ? "text-white" : "text-white/90"
            )}
          >
            {label}
          </p>
          {description ? (
            <p className="text-xs text-white/60 mt-0.5 leading-snug">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
