import type { Metadata } from "next";
import { PaymentFailedView } from "@/features/payment/components/payment-failed-view";

export const metadata: Metadata = {
  title: "Pembayaran Tidak Berhasil",
};

export default async function PaymentFailedPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <PaymentFailedView orderId={orderId} />;
}
