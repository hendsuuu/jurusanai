"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ApiClientError } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionCard } from "./option-card";
import { WizardProgress } from "./wizard-progress";
import { WizardStepShell } from "./wizard-step-shell";
import { WizardNavigation } from "./wizard-navigation";
import { RecommendationLoading } from "./recommendation-loading";
import {
  AGE_RANGE_OPTIONS,
  AREA_OPTIONS,
  ASSET_OPTIONS,
  CAPITAL_OPTIONS,
  CATEGORY_OPTIONS,
  INCOME_OPTIONS,
  MARGIN_OPTIONS,
  RISK_OPTIONS,
  SELLING_OPTIONS,
  TIME_OPTIONS,
  TOTAL_STEPS,
} from "../constants/wizard-steps";
import { useCreateRecommendationMutation } from "../hooks/use-planner-mutations";
import { usePlannerDraft } from "../hooks/use-planner-draft";
import { plannerWizardSchema, type PlannerWizardValues } from "../schemas/wizard-schema";
import { queryKeys } from "@/lib/query-client";
import { useQueryClient } from "@tanstack/react-query";
import type { CreateRecommendationResponse } from "../types";

type StepKey =
  | "locationCity"
  | "ageRange"
  | "capitalRange"
  | "areaType"
  | "categoryInterest"
  | "sellingModel"
  | "availableTime"
  | "assets"
  | "targetIncome"
  | "riskPreference"
  | "marginPreference";

const STEPS: Array<{
  key: StepKey;
  title: string;
  hint?: string;
  required: boolean;
}> = [
  { key: "locationCity", title: "Siapa nama kamu?", hint: "Biar hasilnya terasa lebih personal.", required: true },
  { key: "ageRange", title: "Berapa rentang umur kamu?", hint: "Supaya analisisnya nyambung dengan fase hidupmu sekarang.", required: true },
  { key: "capitalRange", title: "Kalau punya waktu kosong 3 jam, kamu paling mungkin...", hint: "Pilih yang paling kamu banget.", required: true },
  { key: "areaType", title: "Kehidupan ideal kamu di masa depan kayak gimana?", hint: "Pilih yang paling mendekati.", required: true },
  { key: "categoryInterest", title: "Hal apa yang paling bikin kamu penasaran?", hint: "Yang bikin kamu betah ngulik berjam-jam.", required: true },
  { key: "sellingModel", title: "Kamu paling nyaman bekerja dengan cara...", required: false },
  { key: "availableTime", title: "Cara kamu menyelesaikan tugas biasanya...", required: false },
  { key: "assets", title: "Mana yang paling menggambarkan dirimu?", hint: "Pilih beberapa yang paling cocok.", required: false },
  { key: "targetIncome", title: "Apa yang paling kamu cari dari masa depan?", required: false },
  { key: "riskPreference", title: "Dalam situasi sosial, kamu cenderung...", required: false },
  { key: "marginPreference", title: "Saat ambil keputusan penting, kamu lebih...", hint: "Tidak ada jawaban yang salah.", required: false },
];

export function PlannerWizard() {
  const router = useRouter();
  const qc = useQueryClient();
  const [stepIndex, setStepIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const { values, setValues, hydrated, clearDraft } = usePlannerDraft();
  const mutation = useCreateRecommendationMutation();

  const step = STEPS[stepIndex];

  const isStepValid = useMemo(() => {
    if (!step.required) return true;
    const value = values[step.key as keyof PlannerWizardValues];
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value && String(value).trim().length >= (step.key === "locationCity" ? 2 : 1));
  }, [step, values]);

  function setField<K extends keyof PlannerWizardValues>(
    key: K,
    value: PlannerWizardValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAsset(value: string) {
    setValues((prev) => {
      const set = new Set(prev.assets);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...prev, assets: Array.from(set) };
    });
  }

  function next() {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    }
  }

  function back() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  async function submit() {
    const parsed = plannerWizardSchema.safeParse(values);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Lengkapi data wizard.";
      toast.error(first);
      return;
    }
    try {
      const data = await mutation.mutateAsync(parsed.data);
      qc.setQueryData<CreateRecommendationResponse>(
        ["planner", "recommendations", data.planId],
        data
      );
      // Pre-fill the preview cache shape (still empty until report generated)
      qc.setQueryData(queryKeys.planner.preview(data.planId), {
        planId: data.planId,
        selectedIdeaName: null,
        selectedTemplateId: null,
        locationCity: parsed.data.locationCity,
        ageRange: parsed.data.ageRange,
        areaType: parsed.data.areaType,
        categoryInterest: parsed.data.categoryInterest,
        capitalRange: parsed.data.capitalRange,
        status: "RECOMMENDED",
        aiPlan: null,
        result: data.result,
        hasSuccessfulOrder: false,
        pdfReady: false,
        pdfUrl: null,
      });
      clearDraft();
      setIsNavigating(true);
      router.push(`/planner/recommendations?planId=${data.planId}`);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Rekomendasi belum berhasil dibuat. Coba ulangi dalam beberapa saat.";
      toast.error(message);
    }
  }

  // Show full-screen loading state while AI generates recommendations
  // OR while navigating to the results page (prevents wizard glitch flash)
  if (mutation.isPending || isNavigating) {
    return <RecommendationLoading />;
  }

  return (
    <div
      className="min-h-[100svh] flex flex-col relative"
      style={{
        background:
          "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12), transparent 40%), linear-gradient(135deg, #4B5320 0%, #3A4327 100%)",
      }}
    >
      {/* Subtle pattern */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Centered scroll wrapper */}
      <div className="relative flex-1 flex flex-col items-stretch justify-center px-4 sm:px-6 py-6 sm:py-10">
        <div className="w-full max-w-[640px] mx-auto">
          <WizardProgress
            current={stepIndex + 1}
            total={TOTAL_STEPS}
            className="mb-5 sm:mb-7"
          />
          <div>
            <AnimatePresence mode="wait">
              {hydrated ? renderStep() : null}
            </AnimatePresence>
          </div>
          <div className="mt-5 sm:mt-6">
            <WizardNavigation
              canGoBack={stepIndex > 0}
              canGoNext={isStepValid}
              isLastStep={stepIndex === STEPS.length - 1}
              isSubmitting={mutation.isPending}
              onBack={back}
              onNext={next}
              onSubmit={submit}
            />
          </div>
        </div>
      </div>
    </div>
  );

  function renderStep() {
    return (
      <WizardStepShell key={step.key} title={step.title} hint={step.hint}>
        {step.key === "capitalRange" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CAPITAL_OPTIONS.map((o) => (
              <OptionCard
                key={o.value}
                label={o.label}
                description={o.description}
                selected={values.capitalRange === o.value}
                onClick={() => setField("capitalRange", o.value)}
              />
            ))}
          </div>
        )}

        {step.key === "locationCity" && (
          <div className="space-y-2 max-w-md">
            <Label htmlFor="locationCity" className="text-white/80">Nama kamu</Label>
            <Input
              id="locationCity"
              placeholder="contoh: Raka"
              value={values.locationCity}
              onChange={(e) => setField("locationCity", e.target.value)}
              autoFocus
            />
            <p className="text-[11px] sm:text-xs text-white/55">
              Nama membantu membuat hasil analisis terasa lebih personal.
            </p>
          </div>
        )}

        {step.key === "ageRange" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AGE_RANGE_OPTIONS.map((o) => (
              <OptionCard
                key={o.value}
                label={o.label}
                description={o.description}
                selected={values.ageRange === o.value}
                onClick={() => setField("ageRange", o.value)}
              />
            ))}
          </div>
        )}

        {step.key === "areaType" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AREA_OPTIONS.map((o) => (
              <OptionCard
                key={o.value}
                label={o.label}
                selected={values.areaType === o.value}
                onClick={() => setField("areaType", o.value)}
              />
            ))}
          </div>
        )}

        {step.key === "categoryInterest" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CATEGORY_OPTIONS.map((o) => (
              <OptionCard
                key={o.value}
                label={o.label}
                selected={values.categoryInterest === o.value}
                onClick={() => setField("categoryInterest", o.value)}
              />
            ))}
          </div>
        )}

        {step.key === "sellingModel" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SELLING_OPTIONS.map((o) => (
              <OptionCard
                key={o.value}
                label={o.label}
                selected={values.sellingModel === o.value}
                onClick={() => setField("sellingModel", o.value)}
              />
            ))}
          </div>
        )}

        {step.key === "availableTime" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TIME_OPTIONS.map((o) => (
              <OptionCard
                key={o.value}
                label={o.label}
                selected={values.availableTime === o.value}
                onClick={() => setField("availableTime", o.value)}
              />
            ))}
          </div>
        )}

        {step.key === "assets" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ASSET_OPTIONS.map((o) => (
              <OptionCard
                key={o.value}
                label={o.label}
                selected={values.assets.includes(o.value)}
                onClick={() => toggleAsset(o.value)}
                multi
              />
            ))}
          </div>
        )}

        {step.key === "targetIncome" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INCOME_OPTIONS.map((o) => (
              <OptionCard
                key={o.value}
                label={o.label}
                selected={values.targetIncome === o.value}
                onClick={() => setField("targetIncome", o.value)}
              />
            ))}
          </div>
        )}

        {step.key === "riskPreference" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {RISK_OPTIONS.map((o) => (
              <OptionCard
                key={o.value}
                label={o.label}
                description={o.description}
                selected={values.riskPreference === o.value}
                onClick={() => setField("riskPreference", o.value)}
              />
            ))}
          </div>
        )}

        {step.key === "marginPreference" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MARGIN_OPTIONS.map((o) => (
              <OptionCard
                key={o.value}
                label={o.label}
                description={o.description}
                selected={values.marginPreference === o.value}
                onClick={() => setField("marginPreference", o.value)}
              />
            ))}
          </div>
        )}
      </WizardStepShell>
    );
  }
}
