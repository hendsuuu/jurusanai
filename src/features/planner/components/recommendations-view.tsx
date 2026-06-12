"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Lock, ArrowRight } from "lucide-react";
import { ErrorState } from "@/components/shared/error-state";
import { JurusanTeaserCard, TraitChip } from "./recommendation-card";
import { RecommendationLoading } from "./recommendation-loading";
import { plannerApi } from "../api/planner-api";
import {
  PricingModal,
  type PricingModalSubmit,
} from "@/features/payment/components/pricing-modal";
import { useCreatePaymentMutation } from "@/features/payment/hooks/use-payment";
import type { PackageType } from "@/features/payment/types";
import type { CreateRecommendationResponse, PersonalityResult } from "../types";

export function RecommendationsView({ planId }: { planId: string }) {
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingPackage, setPendingPackage] = useState<PackageType | null>(null);

  const recsQuery = useQuery<CreateRecommendationResponse>({
    queryKey: ["planner", "recommendations", planId],
    queryFn: async () => {
      const preview = await plannerApi.getPreview(planId);
      const result = (preview as unknown as { result?: PersonalityResult }).result;
      if (result) {
        return { planId, result };
      }
      throw new Error("Sesi hasil tidak ditemukan.");
    },
    staleTime: Infinity,
    retry: 1,
  });

  const paymentMutation = useCreatePaymentMutation();
  const isCheckoutBusy = paymentMutation.isPending;

  const result = recsQuery.data?.result ?? null;

  function handleOpenPricing() {
    if (isCheckoutBusy) return;
    setModalOpen(true);
  }

  function handleCloseModal() {
    if (isCheckoutBusy) return;
    setModalOpen(false);
    setTimeout(() => setPendingPackage(null), 150);
  }

  async function handleModalSubmit(payload: PricingModalSubmit) {
    if (!result) return;
    setPendingPackage(payload.packageType);
    try {
      const payRes = await paymentMutation.mutateAsync({
        planId,
        templateId: result.personalityId,
        packageType: payload.packageType,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
      });

      if (payRes.paymentUrl) {
        window.location.href = payRes.paymentUrl;
      } else {
        router.push(`/payment/redirect/${payRes.orderId}`);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal melanjutkan ke pembayaran.";
      toast.error(msg);
      setPendingPackage(null);
    }
  }

  if (recsQuery.isLoading) {
    return <RecommendationLoading />;
  }

  if (recsQuery.isError || !result) {
    return (
      <Container variant="default" className="py-10">
        <ErrorState
          title="Sesi hasil tidak tersedia"
          description="Coba ulangi quiz untuk mendapatkan hasil analisis baru."
          action={
            <Button variant="primary" onClick={() => router.push("/planner")}>
              Mulai ulang
            </Button>
          }
        />
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {/* Hero — personality identity */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          background:
            "radial-gradient(circle at 80% 10%, rgba(201,162,78,0.22), transparent 35%), linear-gradient(135deg, #4B5320 0%, #2F3A22 100%)",
        }}
      >
        <Container variant="default" className="relative py-10 sm:py-14">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/planner")}
            className="mb-4 !text-white/80 hover:!text-white hover:!bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Ubah jawaban
          </Button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/12 border border-white/20 text-xs font-medium text-white/95 mb-4 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-[#E4D9A8]" />
            Personality Identity Kamu
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {result.personalityTitle}
          </h1>
          <p className="mt-3 text-lg text-white/85 max-w-2xl">{result.tagline}</p>
          <p className="mt-4 text-sm sm:text-base text-white/75 max-w-2xl leading-relaxed">
            {result.summary}
          </p>
        </Container>
      </section>

      <Container variant="default" className="py-8 sm:py-12 space-y-10">
        {/* Emotional preview */}
        <div className="rounded-2xl border border-[#CDD2A8] bg-[#F0EEDD] p-5 sm:p-6">
          <p className="text-sm font-semibold text-[#4B5320] uppercase tracking-wider mb-2">
            Yang mungkin kamu rasakan
          </p>
          <p className="text-[#2A311A] text-base sm:text-lg leading-relaxed italic">
            &ldquo;{result.emotionalPreview}&rdquo;
          </p>
        </div>

        {/* Core traits */}
        {result.coreTraits.length > 0 ? (
          <div>
            <h2 className="text-lg font-bold text-[#2A311A] mb-3">Pola Karaktermu</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {result.coreTraits.map((t) => (
                <TraitChip key={t.name} name={t.name} score={t.score} />
              ))}
            </div>
          </div>
        ) : null}

        {/* Top jurusan teaser */}
        <div>
          <h2 className="text-lg font-bold text-[#2A311A] mb-1">Top Jurusan yang Cocok</h2>
          <p className="text-sm text-[#57604A] mb-4">
            Ini 3 jurusan paling relate sama kamu. Daftar lengkap top 5 + alasan mendalam ada di full report.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {result.topJurusan.map((j, idx) => (
              <motion.div
                key={j.name}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 + idx * 0.08 }}
              >
                <JurusanTeaserCard jurusan={j} rank={idx} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Basic future direction */}
        <div className="rounded-2xl border border-[#DDD9BD] bg-white p-5 sm:p-6">
          <p className="text-sm font-semibold text-[#4B5320] uppercase tracking-wider mb-2">
            Arah masa depanmu
          </p>
          <p className="text-[#2A311A] leading-relaxed">{result.basicFutureDirection}</p>
        </div>

        {/* Premium unlock CTA */}
        <div
          className="rounded-3xl p-6 sm:p-8 text-center text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #4B5320 0%, #2F3A22 100%)" }}
        >
          <div className="relative">
            <Lock className="w-8 h-8 mx-auto mb-3 text-[#E4D9A8]" />
            <h2 className="text-xl sm:text-2xl font-extrabold">
              Mau lihat analisis lengkap tentang dirimu?
            </h2>
            <p className="mt-2 text-white/80 max-w-xl mx-auto text-sm sm:text-base">
              Buka full report: personality breakdown, top 5 jurusan + alasan, arah karir, warning area,
              future lifestyle, dan skill roadmap — dikirim sebagai PDF aesthetic ke emailmu.
            </p>
            <Button
              onClick={handleOpenPricing}
              loading={isCheckoutBusy}
              className="mt-6 !bg-[#C9A24E] !text-[#2A311A] hover:!bg-[#B58E3C]"
            >
              Unlock Full Report
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="mt-4 text-xs text-white/55 inline-flex items-center gap-1.5 justify-center w-full">
              <Lock className="w-3 h-3" />
              Pembayaran aman lewat Midtrans, hasil dikirim otomatis ke email.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Hasil JuruScope adalah panduan untuk mengenal diri dan menentukan arah, bukan keputusan mutlak.
        </p>

        <PricingModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSubmit={handleModalSubmit}
          isSubmitting={isCheckoutBusy}
          selectedPackage={pendingPackage}
          contextLabel={result.personalityTitle}
        />
      </Container>
    </motion.div>
  );
}
