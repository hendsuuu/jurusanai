"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { XCircle, RefreshCw, Home } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { OrderSummaryCard } from "./order-summary-card";
import { useOrderStatus } from "../hooks/use-payment";

const STATUS_COPY: Record<string, { title: string; description: string }> = {
  FAILED: {
    title: "Pembayaran gagal",
    description: "Pembayaran tidak berhasil diproses. Kamu bisa coba lagi.",
  },
  EXPIRED: {
    title: "Pembayaran kedaluwarsa",
    description: "Sesi pembayaran sudah lewat batas waktu.",
  },
  CANCELED: {
    title: "Pembayaran dibatalkan",
    description: "Pembayaran ini dibatalkan.",
  },
};

export function PaymentFailedView({ orderId }: { orderId: string }) {
  const router = useRouter();
  const orderQuery = useOrderStatus(orderId);

  if (orderQuery.isLoading) {
    return (
      <Container variant="narrow" className="py-10">
        <LoadingState message="Memuat detail pesanan…" />
      </Container>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <Container variant="narrow" className="py-10">
        <ErrorState
          title="Tidak bisa memuat order"
          onRetry={() => orderQuery.refetch()}
        />
      </Container>
    );
  }

  const order = orderQuery.data;
  const copy = STATUS_COPY[order.status] ?? {
    title: "Pembayaran tidak berhasil",
    description: "Coba lakukan pembayaran ulang.",
  };

  return (
    <Container variant="narrow" className="py-10 space-y-5">
      <div className="rounded-3xl border border-[#DDD9BD] bg-white p-8 text-center space-y-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="flex justify-center">
          <div className="rounded-full bg-[#FEF2F2] p-3.5 ring-4 ring-[#DC2626]/10">
            <XCircle className="w-10 h-10 text-[#DC2626]" aria-hidden />
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#2A311A] tracking-tight">{copy.title}</h1>
        <p className="text-sm text-[#57604A] max-w-sm mx-auto">
          {copy.description}
        </p>
      </div>

      <OrderSummaryCard order={order} />

      <div className="rounded-3xl border border-[#DDD9BD] bg-white p-6 space-y-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <Button
          onClick={() => router.push(`/planner/preview/${order.planId}`)}
          className="w-full sm:w-auto !rounded-full !h-12 !px-6"
        >
          <RefreshCw className="w-4 h-4" />
          Coba bayar ulang
        </Button>
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
