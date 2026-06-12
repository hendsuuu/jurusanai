import type { Metadata } from "next";
import { PlanDetailView } from "@/features/admin/components/plan-detail-view";

export const metadata: Metadata = { title: "Detail Hasil" };

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  return <PlanDetailView planId={planId} />;
}
