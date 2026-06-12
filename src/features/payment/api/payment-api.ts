import { apiClient } from "@/lib/api-client";
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  OrderDetailResponse,
} from "../types";

export const paymentApi = {
  createPayment: (payload: CreatePaymentRequest) =>
    apiClient<CreatePaymentResponse>("/api/orders/create-payment", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getOrder: (orderId: string) =>
    apiClient<OrderDetailResponse>(`/api/orders/${orderId}`),

  /**
   * Server-side check of Midtrans transaction status.
   * This calls Midtrans Core API directly from our backend and syncs
   * the result to our DB. Essential for localhost dev where webhooks
   * cannot reach the server.
   */
  checkStatus: (orderId: string) =>
    apiClient<OrderDetailResponse>(`/api/orders/${orderId}/check-status`),
};
