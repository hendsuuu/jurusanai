import type { Metadata } from "next";
import { RecommendationsClient } from "./recommendations-client";

export const metadata: Metadata = {
  title: "Rekomendasi Ide Usaha",
};

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string }>;
}) {
  const { planId } = await searchParams;
  return <RecommendationsClient planId={planId ?? ""} />;
}
