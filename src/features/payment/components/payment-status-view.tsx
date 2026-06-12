"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { PaymentCheckingCard } from "./payment-checking-card";
import { OrderSummaryCard } from "./order-summary-card";
import { useOrderStatus } from "../hooks/use-payment";

const POLL_TIMEOUT_MS = 5 * 60_000;

export function PaymentStatusView({ orderId }: { orderId: string }) {
  const router = useRouter();
  const startedAt = useRef<number>(Date.now());
  const orderQuery = useOrderStatus(orderId);

  useEffect(() => {
    const status = orderQuery.data?.status;
    if (!status) return;
    if (status === "SUCCESS") {
      router.replace(`/payment/status/${orderId}`);
    } else if (
      status === "FAILED" ||
      status === "EXPIRED" ||
      status === "CANCELED"
    ) {
      router.replace(`/payment/failed/${orderId}`);
    }
  }, [orderQuery.data?.status, orderId, router]);

  const elapsed = Date.now() - startedAt.current;
  const timedOut =
    elapsed > POLL_TIMEOUT_MS && orderQuery.data?.status === "PENDING";

  if (orderQuery.isError) {
    return (
      <Container variant="default" className="py-10">
        <ErrorState
          title="Tidak bisa mengecek status pembayaran"
          description="Jaringan mungkin sedang bermasalah."
          onRetry={() => orderQuery.refetch()}
        />
      </Container>
    );
  }

  return (
    <Container variant="narrow" className="py-10 space-y-5">
      <PaymentCheckingCard />
      {orderQuery.data ? <OrderSummaryCard order={orderQuery.data} /> : null}
      {timedOut ? (
        <div className="text-center space-y-3 rounded-3xl border border-[#DDD9BD] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="text-sm text-[#57604A]">
            Status masih PENDING setelah beberapa menit. Refresh halaman ini
            atau cek email kamu.
          </p>
          <Button variant="outline" onClick={() => orderQuery.refetch()} className="!rounded-full">
            Cek lagi
          </Button>
        </div>
      ) : null}
    </Container>
  );
}
