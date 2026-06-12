"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { paymentApi } from "../api/payment-api";
import { queryKeys } from "@/lib/query-client";
import type { OrderDetailResponse } from "../types";

export function useCreatePaymentMutation() {
  return useMutation({
    mutationFn: paymentApi.createPayment,
  });
}

/**
 * Poll order status with progressive loading.
 *
 * - If `initialData` is provided (server-prefetched), the query starts
 *   with data already available — no loading state on first render.
 * - Uses `check-status` endpoint which queries Midtrans when PENDING.
 * - Polls every 4s until terminal state (SUCCESS+PDF_READY or FAILED/EXPIRED).
 */
export function useOrderStatus(
  orderId: string,
  options?: { initialData?: OrderDetailResponse | null }
) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => paymentApi.checkStatus(orderId),
    enabled: Boolean(orderId),
    // Server-prefetched data — avoids loading skeleton on first paint
    initialData: options?.initialData ?? undefined,
    // Mark initial data as potentially stale so it refetches immediately
    initialDataUpdatedAt: options?.initialData ? Date.now() - 5000 : undefined,
    refetchInterval: (query) => {
      const data = query.state.data;
      const status = data?.status;
      const pdfReady = data?.discoveryResult?.pdfReady;

      // Stop polling on terminal failure states
      if (
        status === "FAILED" ||
        status === "EXPIRED" ||
        status === "CANCELED"
      ) {
        return false;
      }
      // Stop polling once payment is SUCCESS *and* PDF is rendered.
      if (status === "SUCCESS" && pdfReady) return false;
      // Otherwise poll every 4s (covers PENDING + SUCCESS-but-PDF-not-ready)
      return 4000;
    },
    refetchIntervalInBackground: false,
  });
}
