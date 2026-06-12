"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/admin-api";
import {
  queryKeys,
  type AdminLogQueryParams,
  type AdminOrderQueryParams,
  type AdminPlanQueryParams,
} from "@/lib/query-client";

export function useAdminOverview() {
  return useQuery({
    queryKey: queryKeys.admin.overview,
    queryFn: adminApi.getOverview,
  });
}

export function useAdminOrders(params: AdminOrderQueryParams) {
  return useQuery({
    queryKey: queryKeys.admin.orders(params),
    queryFn: () => adminApi.listOrders(params),
  });
}

export function useAdminOrderDetail(orderId: string) {
  return useQuery({
    queryKey: queryKeys.admin.orderDetail(orderId),
    queryFn: () => adminApi.getOrderDetail(orderId),
    enabled: Boolean(orderId),
    // Auto-refetch when the user returns to the page (e.g. after coming
    // back from Midtrans / a manual reload of a paid order) so the
    // PDF/email status reflects whatever the webhook just finished.
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    // Poll lightly while the order is still working its way through the
    // post-payment pipeline (plan generation → PDF render → email).
    // Stops polling once the plan is in a terminal state.
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const planStatus = data.order.discoveryResult?.status;
      const emailStatus = data.order.email.status;
      const isPlanFinal =
        planStatus === "PDF_READY" || planStatus === "FAILED";
      const isEmailFinal =
        emailStatus === "SENT" ||
        emailStatus === "FAILED" ||
        emailStatus === "BOUNCED";
      // Keep polling while either pipeline is still running.
      if (!isPlanFinal || !isEmailFinal) return 5000;
      return false;
    },
    refetchIntervalInBackground: false,
  });
}

export function useResendOrderEmail(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.resendOrderEmail(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.orderDetail(orderId) });
    },
  });
}

/**
 * Admin retry of the full post-payment pipeline. Re-queues the order
 * to Inngest after resetting the business plan status to PAID. Used for
 * orders whose pipeline failed (status=FAILED).
 */
export function useRetryOrderGenerate(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.retryGenerate(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.orderDetail(orderId) });
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}

/**
 * Admin regenerate-PDF-only. Skips AI step when an `aiPlanJson` already
 * exists; falls back to full pipeline otherwise.
 */
export function useRegenerateOrderPdf(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.regeneratePdf(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.orderDetail(orderId) });
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}

export function useAdminPlans(params: AdminPlanQueryParams) {
  return useQuery({
    queryKey: queryKeys.admin.plans(params),
    queryFn: () => adminApi.listPlans(params),
  });
}

export function useAdminPlanDetail(planId: string) {
  return useQuery({
    queryKey: queryKeys.admin.planDetail(planId),
    queryFn: () => adminApi.getPlanDetail(planId),
    enabled: Boolean(planId),
    refetchOnMount: "always",
  });
}

export function useGeneratePlanPdf(planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.generatePlanPdf(planId),
    onSuccess: () => {
      // Invalidate plan detail (status, pdfUrl change)
      qc.invalidateQueries({ queryKey: queryKeys.admin.planDetail(planId) });
      // Invalidate plan list (status column)
      qc.invalidateQueries({ queryKey: ["admin", "plans"] });
      // Invalidate any related order detail (PDF readiness)
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}

export function useAdminLogs(params: AdminLogQueryParams) {
  return useQuery({
    queryKey: queryKeys.admin.logs(params),
    queryFn: () => adminApi.listLogs(params),
  });
}
