"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

export function WizardNavigation({
  canGoBack,
  canGoNext,
  isLastStep,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
  nextLabel,
}: {
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        aria-label="Kembali"
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/12 disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Kembali</span>
      </button>

      {/* Primary CTA */}
      <button
        type="button"
        onClick={isLastStep ? onSubmit : onNext}
        disabled={!canGoNext || isSubmitting}
        className="inline-flex items-center justify-center gap-2 flex-1 sm:flex-initial h-11 sm:h-12 px-5 sm:px-7 rounded-full bg-[#C9A24E] text-[#2A311A] text-sm font-bold hover:bg-[#B58E3C] shadow-[0_14px_30px_rgba(201,162,78,0.28)] hover:-translate-y-px disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
      >
        {isSubmitting ? (
          <span className="inline-block w-4 h-4 border-2 border-[#2A311A] border-t-transparent rounded-full animate-spin" />
        ) : null}
        {isLastStep ? (nextLabel ?? "Buat rekomendasi") : "Lanjut"}
        {!isLastStep && !isSubmitting ? <ArrowRight className="w-4 h-4" /> : null}
      </button>
    </div>
  );
}
