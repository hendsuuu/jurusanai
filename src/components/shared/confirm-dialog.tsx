"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmDialogVariant = "default" | "danger" | "warning";

const VARIANT_STYLES: Record<
  ConfirmDialogVariant,
  { iconBg: string; iconColor: string; cta: "primary" | "danger" }
> = {
  default: {
    iconBg: "bg-[#E6E8D2]",
    iconColor: "text-[#4B5320]",
    cta: "primary",
  },
  warning: {
    iconBg: "bg-[#FFFBEB]",
    iconColor: "text-[#B58E3C]",
    cta: "primary",
  },
  danger: {
    iconBg: "bg-[#FEF2F2]",
    iconColor: "text-[#DC2626]",
    cta: "danger",
  },
};

export type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
  /** Custom icon to override the default. */
  icon?: React.ReactNode;
};

/**
 * Reusable confirmation dialog. Use for any destructive or important
 * action that needs a "are you sure?" gate (logout, delete, etc).
 *
 * Closes on ESC, backdrop click, or the cancel button (if not loading).
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "default",
  loading = false,
  icon,
}: ConfirmDialogProps) {
  // ESC + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  const styles = VARIANT_STYLES[variant];

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={() => {
          if (!loading) onClose();
        }}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#DDD9BD] shadow-[0_24px_70px_rgba(15,23,42,0.16)] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#DDD9BD] flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                styles.iconBg
              )}
            >
              {icon ?? (
                <AlertTriangle className={cn("w-5 h-5", styles.iconColor)} />
              )}
            </div>
            <div className="min-w-0">
              <h2
                id="confirm-dialog-title"
                className="text-lg font-bold text-[#2A311A] tracking-tight"
              >
                {title}
              </h2>
              {description ? (
                <p className="mt-1 text-sm text-[#57604A] leading-relaxed">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            disabled={loading}
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A8A72] hover:bg-[#F0EEDD] hover:text-[#2A311A] disabled:opacity-50 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex gap-2 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={styles.cta}
            onClick={() => onConfirm()}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
