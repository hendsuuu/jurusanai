"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { plannerApi } from "../api/planner-api";
import { queryKeys } from "@/lib/query-client";
import type { PlanPreviewResponse } from "../types";

export function useCreateRecommendationMutation() {
  return useMutation({
    mutationFn: plannerApi.createRecommendation,
  });
}

export function useSelectBusinessIdeaMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: plannerApi.selectBusinessIdea,
    onSuccess: (data) => {
      // Seed the preview cache so the next page can render instantly
      qc.setQueryData<PlanPreviewResponse>(
        queryKeys.planner.preview(data.planId),
        (prev) => ({
          ...(prev ?? ({} as PlanPreviewResponse)),
          planId: data.planId,
          selectedIdeaName: data.selectedIdeaName,
          aiPlan: data.aiPlan,
          status: "GENERATED",
          result: prev?.result ?? null,
          hasSuccessfulOrder: prev?.hasSuccessfulOrder ?? false,
          pdfReady: prev?.pdfReady ?? false,
          pdfUrl: prev?.pdfUrl ?? null,
          locationCity: prev?.locationCity ?? "",
          ageRange: prev?.ageRange ?? "",
          areaType: prev?.areaType ?? "",
          categoryInterest: prev?.categoryInterest ?? "",
          capitalRange: prev?.capitalRange ?? "",
          selectedTemplateId: prev?.selectedTemplateId ?? null,
        })
      );
    },
  });
}

export function usePlanPreview(planId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.planner.preview(planId),
    queryFn: () => plannerApi.getPreview(planId),
    enabled: options?.enabled ?? Boolean(planId),
  });
}
