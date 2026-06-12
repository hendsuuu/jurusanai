"use client";

import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Download, Lock } from "lucide-react";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { LockedPdfPreview } from "./locked-pdf-preview";
import { usePlanPreview } from "../hooks/use-planner-mutations";

/**
 * Result/preview page. After the new payment flow, paid checkout happens
 * directly from the Recommendations page, so this view mainly:
 *   1. Shows a download link to users whose report is paid + PDF ready.
 *   2. Provides a fallback for in-progress/unpaid plans with guidance to
 *      return to the result page.
 */
export function PlanPreviewView({ planId }: { planId: string }) {
  const router = useRouter();
  const previewQuery = usePlanPreview(planId);

  if (previewQuery.isLoading) {
    return (
      <Container variant="default" className="py-10">
        <LoadingState message="Sedang menyusun hasil self discovery kamu." />
      </Container>
    );
  }

  if (previewQuery.isError || !previewQuery.data) {
    return (
      <Container variant="default" className="py-10">
        <ErrorState
          title="Hasil belum siap"
          description="Coba ulangi quiz untuk mendapatkan hasil baru."
          onRetry={() => previewQuery.refetch()}
        />
      </Container>
    );
  }

  const data = previewQuery.data;
  const personalityTitle = data.selectedIdeaName ?? data.result?.personalityTitle ?? "Self Discovery";

  // Already paid + PDF ready → show download CTA.
  if (data.hasSuccessfulOrder && data.pdfReady) {
    return (
      <Container variant="default" className="py-10 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="-ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
        <PageHeader
          title={personalityTitle}
          description="Self discovery report kamu sudah siap diunduh."
          action={<Badge variant="success">PDF siap diunduh</Badge>}
        />
        <Card className="p-6 sm:p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Full report kamu siap.
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Klik tombol di bawah untuk mengunduh laporan PDF lengkap. Salinan juga sudah dikirim ke emailmu.
          </p>
          {data.pdfUrl ? (
            <Button onClick={() => window.open(data.pdfUrl!, "_blank")}>
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          ) : null}
        </Card>
      </Container>
    );
  }

  // Report generated/teaser available but not yet paid — push back to result page.
  return (
    <Container variant="default" className="py-8 sm:py-12 space-y-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="-ml-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </Button>

      <PageHeader
        title={personalityTitle}
        description="Hasil self discovery kamu."
        action={
          <Badge variant="info">
            <Sparkles className="w-3 h-3" />
            Hasil tersedia
          </Badge>
        }
      />

      {data.result ? (
        <section className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 space-y-4">
            <h2 className="text-lg font-semibold">{data.result.personalityTitle}</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{data.result.summary}</p>
            <h3 className="font-semibold pt-2">Arah Masa Depan</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {data.result.basicFutureDirection}
            </p>
          </Card>
          <LockedPdfPreview />
        </section>
      ) : null}

      <Card className="p-6 sm:p-8 text-center space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Belum membuka full report?
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Untuk membuka self discovery report lengkap, kembali ke halaman hasil dan
          pilih paket.
        </p>
        <Button onClick={() => router.push(`/planner/recommendations?planId=${planId}`)}>
          Buka Pilih Paket
        </Button>
        <p className="text-xs text-slate-500 inline-flex items-center gap-1.5 justify-center w-full">
          <Lock className="w-3 h-3" />
          Pembayaran aman lewat Midtrans, hasil dikirim otomatis ke email.
        </p>
      </Card>
    </Container>
  );
}
