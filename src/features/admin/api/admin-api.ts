import { apiClient } from "@/lib/api-client";
import type {
  AdminLogsResponse,
  AdminOrderDetail,
  AdminOrdersResponse,
  AdminOverview,
  AdminPlanDetail,
  AdminPlansResponse,
} from "../types";

function buildQuery(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export const adminApi = {
  getOverview: () => apiClient<AdminOverview>("/api/admin/overview"),

  listOrders: (params: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) => apiClient<AdminOrdersResponse>(`/api/admin/orders${buildQuery(params)}`),

  getOrderDetail: (orderId: string) =>
    apiClient<AdminOrderDetail>(`/api/admin/orders/${orderId}`),

  /**
   * Trigger a manual resend of the PDF report email for a paid order.
   * Used when the original automatic send failed (or admin wants to retry).
   */
  resendOrderEmail: (orderId: string) =>
    apiClient<{ messageId: string | null }>(
      `/api/admin/orders/${orderId}/resend-email`,
      { method: "POST" }
    ),

  /**
   * Re-queue the full post-payment pipeline (AI plan → PDF → email) for
   * an order whose previous run failed. Resets BusinessPlan status back
   * to PAID and dispatches a fresh `generate.requested` event to Inngest.
   */
  retryGenerate: (orderId: string) =>
    apiClient<{
      orderId: string;
      discoveryResultId: string;
      dispatchMode: "queue" | "sync";
      eventId: string | null;
    }>(`/api/admin/orders/${orderId}/retry-generate`, { method: "POST" }),

  /**
   * Regenerate ONLY the PDF for a paid order (skips AI re-generation when
   * `aiPlanJson` already exists). Useful when template changed or R2 upload
   * glitched. Falls back to full pipeline if AI plan is missing.
   */
  regeneratePdf: (orderId: string) =>
    apiClient<{
      orderId: string;
      discoveryResultId: string;
      dispatchMode: "queue" | "sync";
      eventId: string | null;
    }>(`/api/admin/orders/${orderId}/regenerate-pdf`, { method: "POST" }),

  listPlans: (params: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) => apiClient<AdminPlansResponse>(`/api/admin/plans${buildQuery(params)}`),

  getPlanDetail: (planId: string) =>
    apiClient<AdminPlanDetail>(`/api/admin/plans/${planId}`),

  /**
   * Trigger PDF (re-)generation for a paid plan. Backend handles auth,
   * generation, storage, status update, and email send in one call.
   */
  generatePlanPdf: (planId: string) =>
    apiClient<{ url: string; key: string; email: { ok: boolean; error?: string } }>(
      `/api/pdf/generate/${planId}`,
      { method: "POST" }
    ),

  listLogs: (params: {
    page: number;
    limit: number;
    action?: string;
    entityType?: string;
    entityId?: string;
  }) => apiClient<AdminLogsResponse>(`/api/admin/logs${buildQuery(params)}`),
};
