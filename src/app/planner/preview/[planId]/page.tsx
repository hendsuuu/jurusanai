import type { Metadata } from "next";
import { PlanPreviewView } from "@/features/planner/components/plan-preview-view";

export const metadata: Metadata = {
  title: "Preview Business Plan",
};

export default async function PlanPreviewPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  return <PlanPreviewView planId={planId} />;
}
