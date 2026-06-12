"use client";

import * as React from "react";
import { Check, X, Sparkles, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { PACKAGES } from "@/lib/constants";
import type { PackageType } from "../types";

export type PricingModalSubmit = {
  packageType: PackageType;
  customerName: string;
  customerEmail: string;
};

export type PricingModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: PricingModalSubmit) => void;
  isSubmitting: boolean;
  selectedPackage?: PackageType | null;
  /** Optional context shown at the top — e.g. selected business idea name. */
  contextLabel?: string | null;
  /** Pre-fill values (e.g. user revisited modal) */
  initialName?: string;
  initialEmail?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Pricing modal shown after user clicks the full report CTA. User confirms
 * the paid report package, then fills name + email so
 * the PDF report can be emailed after payment success.
 */
export function PricingModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  selectedPackage,
  contextLabel,
  initialName = "",
  initialEmail = "",
}: PricingModalProps) {
  const defaultPackage = selectedPackage ?? PACKAGES[0]?.type ?? null;
  const [chosen, setChosen] = React.useState<PackageType | null>(
    defaultPackage
  );
  const [name, setName] = React.useState(initialName);
  const [email, setEmail] = React.useState(initialEmail);
  const [touched, setTouched] = React.useState(false);
  const formRef = React.useRef<HTMLDivElement>(null);

  // Reset state when modal opens, sync with initial values.
  React.useEffect(() => {
    if (open) {
      setChosen(selectedPackage ?? PACKAGES[0]?.type ?? null);
      setName(initialName);
      setEmail(initialEmail);
      setTouched(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ESC to close + body scroll lock
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, isSubmitting]);

  const nameValid = name.trim().length >= 2;
  const emailValid = EMAIL_RE.test(email.trim());
  const canSubmit = chosen !== null && nameValid && emailValid && !isSubmitting;

  if (!open) return null;

  function handlePackageClick(pkg: PackageType) {
    setChosen(pkg);
    // Autoscroll to form so user sees the email step on small screens
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  }

  function handleSubmit() {
    setTouched(true);
    if (!canSubmit || !chosen) return;
    onSubmit({
      packageType: chosen,
      customerName: name.trim(),
      customerEmail: email.trim(),
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pricing-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup modal"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* Dialog */}
      <div
        className={cn(
          "relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] border border-[#DDD9BD]",
          "rounded-t-3xl sm:rounded-3xl"
        )}
      >
        {/* Header */}
        <div className="px-5 sm:px-8 pt-5 sm:pt-7 pb-3 border-b border-[#DDD9BD] sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2
                id="pricing-modal-title"
                className="text-lg sm:text-2xl font-extrabold tracking-tight text-[#2A311A]"
              >
                Buka Full Report
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#57604A]">
                Expert Deep Report dikirim sebagai PDF setelah pembayaran berhasil.
              </p>
              {contextLabel ? (
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-[#8A8A72]">
                  <Sparkles className="w-3 h-3 text-[#4B5320]" aria-hidden />
                  Untuk hasil:{" "}
                  <span className="font-semibold text-[#2A311A]">
                    {contextLabel}
                  </span>
                </p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Tutup"
              disabled={isSubmitting}
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#8A8A72] hover:bg-[#F0EEDD] hover:text-[#2A311A] disabled:opacity-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="px-5 sm:px-8 py-5 grid gap-3 sm:gap-4 sm:grid-cols-1">
          {PACKAGES.map((pkg) => {
            const isSelected = chosen === pkg.type;
            return (
              <article
                key={pkg.type}
                onClick={() => !isSubmitting && handlePackageClick(pkg.type)}
                className={cn(
                  "relative rounded-[24px] border bg-white p-4 sm:p-5 flex flex-col gap-3 transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "border-[#4B5320] ring-2 ring-[#4B5320] shadow-[0_20px_48px_rgba(75,83,32,0.12)] -translate-y-0.5"
                    : pkg.recommended
                      ? "border-[#CDD2A8] hover:shadow-[0_20px_48px_rgba(75,83,32,0.12)] hover:-translate-y-0.5"
                      : "border-[#DDD9BD] hover:border-[#CDD2A8] hover:-translate-y-0.5"
                )}
              >
                {pkg.badge && !isSelected ? (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <Badge variant="brand">{pkg.badge}</Badge>
                  </div>
                ) : null}
                {isSelected ? (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <Badge variant="brand">
                      <Check className="w-3 h-3" />
                      Terpilih
                    </Badge>
                  </div>
                ) : null}

                <header>
                  <h3 className="text-base sm:text-lg font-bold text-[#2A311A]">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-[#57604A] mt-0.5">
                    {pkg.tagline}
                  </p>
                </header>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2A311A]">
                    {formatCurrency(pkg.price)}
                  </span>
                  <span className="text-xs text-[#8A8A72]">
                    / plan
                  </span>
                </div>

                <ul className="space-y-1.5 text-[13px] sm:text-sm text-[#3F4A2E] flex-1">
                  {pkg.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check
                        className="w-4 h-4 mt-0.5 text-[#4B5320] shrink-0"
                        aria-hidden
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        {/* Customer info form */}
        <div
          ref={formRef}
          className="px-5 sm:px-8 pb-5 sm:pb-6 pt-2 space-y-3 border-t border-[#DDD9BD]"
        >
          <div className="flex items-center gap-2 pt-1">
            <Mail className="w-4 h-4 text-[#4B5320]" />
            <p className="text-sm font-semibold text-[#2A311A]">
              Pengiriman PDF Report
            </p>
          </div>
          <p className="text-xs text-[#57604A] -mt-1">
            PDF self discovery report akan kami kirim ke email kamu setelah pembayaran
            berhasil.
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pricing-name">Nama Lengkap</Label>
              <Input
                id="pricing-name"
                placeholder="contoh: Andi Pratama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched(true)}
                disabled={isSubmitting}
                autoComplete="name"
              />
              {touched && !nameValid ? (
                <p className="text-[11px] text-red-600">
                  Nama minimal 2 karakter.
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pricing-email">Email</Label>
              <Input
                id="pricing-email"
                type="email"
                placeholder="contoh: andi@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                disabled={isSubmitting}
                autoComplete="email"
                inputMode="email"
              />
              {touched && !emailValid ? (
                <p className="text-[11px] text-red-600">
                  Format email tidak valid.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Submit footer */}
        <div className="sticky bottom-0 px-5 sm:px-8 py-4 border-t border-[#DDD9BD] bg-white">
          <Button
            type="button"
            size="md"
            className="w-full !rounded-full !h-12"
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={isSubmitting}
          >
            {isSubmitting
              ? "Menyiapkan pembayaran…"
              : chosen
                ? `Bayar ${formatCurrency(
                    PACKAGES.find((p) => p.type === chosen)?.price ?? 0
                  )}`
                : "Pilih paket dulu"}
          </Button>
          <p className="text-[11px] text-[#8A8A72] text-center mt-2 inline-flex items-center justify-center gap-1.5 w-full">
            {isSubmitting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : null}
            Pembayaran aman lewat Midtrans. Status sukses dikonfirmasi otomatis.
          </p>
        </div>
      </div>
    </div>
  );
}
