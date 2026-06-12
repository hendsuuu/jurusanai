import { getSnapClient } from "./midtrans.client";
import { logger } from "@/server/utils/logger";

export type MidtransStatusResponse = {
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_status: string;
  fraud_status?: string;
  status_code: string;
  signature_key: string;
  transaction_time?: string;
  settlement_time?: string;
  [key: string]: unknown;
};

/**
 * Check transaction status directly from Midtrans Core API.
 * This is useful in development (localhost) where Midtrans cannot
 * send webhooks to your machine.
 *
 * Uses: GET https://api.sandbox.midtrans.com/v2/{order_id}/status
 */
export async function checkMidtransTransactionStatus(
  orderCode: string
): Promise<MidtransStatusResponse | null> {
  try {
    const snap = getSnapClient();
    // The `transaction` property exists at runtime but is not in @types/midtrans-client
    const transaction = (snap as unknown as { transaction: { status: (id: string) => Promise<unknown> } }).transaction;
    const result = (await transaction.status(
      orderCode
    )) as unknown as MidtransStatusResponse;
    return result;
  } catch (error: unknown) {
    const err = error as {
      message?: string;
      httpStatusCode?: number;
      ApiResponse?: unknown;
    };
    // 404 means transaction not found yet (user hasn't paid)
    if (err.httpStatusCode === 404) {
      return null;
    }
    logger.error("Midtrans status check failed", {
      orderCode,
      message: err.message,
      httpStatusCode: err.httpStatusCode,
      apiResponse: err.ApiResponse,
    });
    return null;
  }
}
