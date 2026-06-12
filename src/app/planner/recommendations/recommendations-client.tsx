"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { LoadingState } from "@/components/shared/loading-state";
import { RecommendationsView } from "@/features/planner/components/recommendations-view";

export function RecommendationsClient({ planId }: { planId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!planId) router.replace("/planner");
  }, [planId, router]);

  if (!planId) {
    return (
      <Container variant="default" className="py-10">
        <LoadingState message="Mengarahkan ke wizard…" />
      </Container>
    );
  }

  return <RecommendationsView planId={planId} />;
}
