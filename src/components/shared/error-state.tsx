"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function ErrorState({
  title = "Terjadi kesalahan",
  description = "Coba lagi dalam beberapa saat.",
  onRetry,
  action,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center text-center py-10 px-6 rounded-2xl border border-red-100 bg-red-50/40"
    >
      <div className="mb-3 text-red-500">
        <AlertTriangle className="w-8 h-8" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600 mt-1 max-w-md">{description}</p>
      <div className="mt-4 flex gap-2">
        {onRetry ? (
          <Button variant="primary" size="sm" onClick={onRetry}>
            Coba lagi
          </Button>
        ) : null}
        {action}
      </div>
    </div>
  );
}
