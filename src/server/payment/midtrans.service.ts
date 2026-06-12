import { env } from "@/lib/env";
import { getSnapClient } from "./midtrans.client";
import { logger } from "@/server/utils/logger";
import { AppError } from "@/server/utils/error";

export type SnapRedirectInput = {
  orderCode: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  itemName: string;
};

export type SnapRedirectResult = {
  token: string;
  redirect_url: string;
  raw: Record<string, unknown>;
};

export async function createSnapRedirectTransaction(
  input: SnapRedirectInput
): Promise<SnapRedirectResult> {
  const snap = getSnapClient();

  const parameter = {
    transaction_details: {
      order_id: input.orderCode,
      gross_amount: input.amount,
    },
    customer_details: {
      first_name: input.customerName || "Customer",
      email: input.customerEmail || undefined,
      phone: input.customerPhone || undefined,
    },
    item_details: [
      {
        id: input.orderCode,
        price: input.amount,
        quantity: 1,
        name: input.itemName.slice(0, 50),
      },
    ],
    // Payment methods:
    // - Production: QRIS only
    // - Development: QRIS + BCA VA (easier to test with Midtrans sandbox simulator)
    enabled_payments: env.MIDTRANS_IS_PRODUCTION
      ? ["other_qris"]
      : ["other_qris", "bca_va"],
    callbacks: {
      finish: env.MIDTRANS_FINISH_REDIRECT_URL,
      unfinish: env.MIDTRANS_UNFINISH_REDIRECT_URL,
      error: env.MIDTRANS_ERROR_REDIRECT_URL,
    },
  };

  try {
    logger.debug("Midtrans createTransaction request", {
      order_id: input.orderCode,
      gross_amount: input.amount,
      serverKeyPrefix: env.MIDTRANS_SERVER_KEY.substring(0, 12) + "...",
    });

    const response = (await snap.createTransaction(
      parameter as never
    )) as unknown as { token: string; redirect_url: string } & Record<
      string,
      unknown
    >;

    if (!response.token || !response.redirect_url) {
      logger.error("Midtrans returned unexpected response", response);
      throw new AppError(
        "INTERNAL_ERROR",
        "Midtrans tidak mengembalikan token/redirect_url",
        500
      );
    }

    return {
      token: response.token,
      redirect_url: response.redirect_url,
      raw: response,
    };
  } catch (error: unknown) {
    // MidtransError has httpStatusCode, ApiResponse, rawHttpClientData
    const midtransErr = error as {
      message?: string;
      httpStatusCode?: number;
      ApiResponse?: unknown;
    };

    if (midtransErr.httpStatusCode || midtransErr.ApiResponse) {
      logger.error("Midtrans API error", {
        message: midtransErr.message,
        httpStatusCode: midtransErr.httpStatusCode,
        apiResponse: midtransErr.ApiResponse,
      });
      throw new AppError(
        "INTERNAL_ERROR",
        `Midtrans error: ${midtransErr.message ?? "Unknown"}`,
        502
      );
    }

    // Re-throw AppError as-is
    if (error instanceof AppError) throw error;

    logger.error("Midtrans unexpected error", error);
    throw new AppError(
      "INTERNAL_ERROR",
      "Gagal menghubungi Midtrans. Coba lagi.",
      500
    );
  }
}
