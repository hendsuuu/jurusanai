"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Home,
  Loader2,
  Mail,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { OrderSummaryCard } from "./order-summary-card";
import { useOrderStatus } from "../hooks/use-payment";
import type { OrderDetailResponse } from "../types";

export function PaymentSuccessView({
  orderId,
  initialOrder,
}: {
  orderId: string;
  initialOrder?: OrderDetailResponse | null;
}) {
  const orderQuery = useOrderStatus(orderId, { initialData: initialOrder });

  const order = orderQuery.data;
  const hasData = Boolean(order);

  // Only show full error if we have NO data at all and query failed
  if (!hasData && orderQuery.isError) {
    return (
      <Container variant="narrow" className="py-10">
        <ErrorState
          title="Tidak bisa memuat order"
          description="Coba refresh halaman ini."
          onRetry={() => orderQuery.refetch()}
        />
      </Container>
    );
  }

  // Minimal skeleton only if truly no data
  if (!hasData && orderQuery.isLoading) {
    return (
      <Container variant="narrow" className="py-10 space-y-4">
        <div className="rounded-3xl border border-[#CDD2A8] bg-white p-8 text-center space-y-3 shadow-[0_16px_40px_rgba(75,83,32,0.06)]">
          <Loader2 className="w-8 h-8 text-[#4B5320] animate-spin mx-auto" />
          <p className="text-sm text-[#57604A]">Memuat detail pesanan…</p>
        </div>
      </Container>
    );
  }

  if (!order) return null;

  const { pdfReady, pdfUrl } = order.discoveryResult;
  const isFinalSuccess = order.status === "SUCCESS";
  const isPending = order.status === "PENDING";

  // Determine if user can still resume the Midtrans Snap session.
  // Conditions:
  //  - status is PENDING (not yet paid, failed, expired, or canceled)
  //  - paymentUrl is available
  //  - expiredAt is in the future (or not set — defensive default)
  const now = Date.now();
  const expiresAtMs = order.expiredAt ? new Date(order.expiredAt).getTime() : null;
  const isExpiredByTime = expiresAtMs !== null && expiresAtMs <= now;
  const canResumePayment =
    isPending && Boolean(order.paymentUrl) && !isExpiredByTime;

  return (
    <Container variant="narrow" className="py-10 space-y-5">
      {/* Hero card */}
      <div className="rounded-3xl border border-[#CDD2A8] bg-white p-6 sm:p-8 text-center space-y-4 relative overflow-hidden shadow-[0_16px_40px_rgba(75,83,32,0.06)]">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-[#E6E8D2] to-[#CDD2A8] blur-3xl opacity-50 pointer-events-none" />
        <div className="relative">
          {isFinalSuccess ? (
            <>
              <div className="flex justify-center">
                <div className="rounded-full bg-[#ECFDF5] p-3.5 ring-4 ring-[#16A34A]/10">
                  <CheckCircle2 className="w-9 h-9 text-[#16A34A]" aria-hidden />
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#2A311A] mt-4 tracking-tight">
                Pembayaran berhasil!
              </h1>
              <p className="text-sm text-[#57604A] max-w-md mx-auto mt-1.5">
                Terima kasih sudah memilih JuruScope.
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="rounded-full bg-[#E6E8D2] p-3.5 ring-4 ring-[#4B5320]/10">
                  <Clock className="w-9 h-9 text-[#4B5320]" aria-hidden />
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#2A311A] mt-4 tracking-tight">
                {isPending ? "Pembayaran sedang diverifikasi" : "Memproses pesanan…"}
              </h1>
              <p className="text-sm text-[#57604A] max-w-md mx-auto mt-1.5">
                Kami sedang mengecek status pembayaranmu. Halaman ini akan update otomatis.
              </p>
            </>
          )}

          {/* Email notice */}
          {isFinalSuccess ? (
            <div className="mt-6 mx-auto max-w-md rounded-2xl border border-[#CDD2A8] bg-[#F0EEDD] p-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E6E8D2] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#4B5320]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#2A311A]">
                    Report akan dikirim ke email kamu
                  </p>
                  <p className="text-xs text-[#57604A] mt-1 leading-relaxed">
                    AI sedang menyusun business plan lalu merender PDF.
                    Laporan dikirim dalam <strong>5–10 menit</strong>. Cek Inbox dan Spam.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Order summary */}
      <OrderSummaryCard order={order} />

      {/* Action card */}
      <div className="rounded-3xl border border-[#DDD9BD] bg-white p-5 sm:p-6 space-y-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        {isPending ? (
          <p className="text-sm text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] px-4 py-2.5 rounded-xl">
            Pembayaran belum terkonfirmasi. Jika sudah bayar, tunggu beberapa saat.
          </p>
        ) : null}

        {/* Resume payment button — only when pending + paymentUrl available + not expired */}
        {canResumePayment && order.paymentUrl ? (
          <a
            href={order.paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto h-12 px-6 rounded-full bg-[#4B5320] text-white text-sm font-bold hover:bg-[#3A4327] shadow-[0_10px_24px_rgba(75,83,32,0.28)] transition-all"
          >
            <CreditCard className="w-4 h-4" />
            Lanjutkan Pembayaran
          </a>
        ) : null}

        {pdfReady && pdfUrl ? (
          <>
            <p className="text-sm text-[#57604A] inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#4B5320]" />
              PDF full report kamu sudah siap.
            </p>
            <Button
              onClick={() => window.open(pdfUrl, "_blank")}
              className="w-full sm:w-auto !rounded-full !h-12 !px-6"
            >
              <Download className="w-4 h-4" />
              Download PDF Business Plan
            </Button>
          </>
        ) : isFinalSuccess ? (
          <Button disabled variant="secondary" className="w-full sm:w-auto !rounded-full !h-11">
            <Loader2 className="w-4 h-4 animate-spin" />
            Business plan sedang disiapkan…
          </Button>
        ) : null}

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 h-11 rounded-full px-5 text-sm font-semibold text-[#57604A] hover:bg-[#F0EEDD] transition-colors"
        >
          <Home className="w-4 h-4" />
          Kembali ke beranda
        </Link>
      </div>
    </Container>
  );
}
