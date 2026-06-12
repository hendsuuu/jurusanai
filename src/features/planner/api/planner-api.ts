import { apiClient } from "@/lib/api-client";
import type {
  CreateRecommendationRequest,
  CreateRecommendationResponse,
  PlanPreviewResponse,
  SelectBusinessIdeaRequest,
  SelectBusinessIdeaResponse,
} from "../types";

export const plannerApi = {
  createRecommendation: (payload: CreateRecommendationRequest) =>
    apiClient<CreateRecommendationResponse>("/api/planner/recommend", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  selectBusinessIdea: (payload: SelectBusinessIdeaRequest) =>
    apiClient<SelectBusinessIdeaResponse>("/api/planner/select-idea", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getPreview: (planId: string) =>
    apiClient<PlanPreviewResponse>(`/api/planner/preview/${planId}`),
};
