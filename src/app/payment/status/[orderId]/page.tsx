import type { Metadata } from "next";
import { getOrderPublic } from "@/server/payment/payment.service";
import { PaymentSuccessView } from "@/features/payment/components/payment-success-view";
import type { OrderDetailResponse } from "@/features/payment/types";

export const metadata: Metadata = {
  title: "Pembayaran",
};

export const dynamic = "force-dynamic";

/**
 * Server-prefetch the order so the page renders immediately with data.
 * The client component then polls check-status in the background for updates.
 */
export default async function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  let initialOrder: OrderDetailResponse | null = null;
  try {
    const data = await getOrderPublic(orderId);
    initialOrder = data as unknown as OrderDetailResponse;
  } catch {
    // If fetch fails, client will handle it via polling
  }

  return <PaymentSuccessView orderId={orderId} initialOrder={initialOrder} />;
}
