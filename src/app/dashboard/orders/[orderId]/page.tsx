import type { Metadata } from "next";
import { OrderDetailView } from "@/features/admin/components/order-detail-view";

export const metadata: Metadata = { title: "Detail Order" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <OrderDetailView orderId={orderId} />;
}
