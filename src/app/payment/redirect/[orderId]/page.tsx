import type { Metadata } from "next";
import { PaymentStatusView } from "@/features/payment/components/payment-status-view";

export const metadata: Metadata = {
  title: "Memproses Pembayaran",
};

export default async function PaymentRedirectPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <PaymentStatusView orderId={orderId} />;
}
