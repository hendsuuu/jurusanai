import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { createPaymentSchema } from "@/server/business/schemas";
import { safeParse } from "@/server/utils/validation";
import { sanitizeText } from "@/server/utils/sanitize";
import { paymentLimiter, rateLimitOrThrow } from "@/server/rate-limit/limiter";
import { getClientIp } from "@/server/rate-limit/keys";
import { createMidtransPayment } from "@/server/payment/payment.service";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    await rateLimitOrThrow(paymentLimiter, `create-payment:${ip}`);

    const body = await req.json().catch(() => null);
    const parsed = safeParse(createPaymentSchema, body);
    if (!parsed.ok) {
      return fail("Input tidak valid", 422, parsed.errors);
    }

    // Sanitize free-text customer fields
    const data = {
      ...parsed.data,
      customerName: parsed.data.customerName
        ? sanitizeText(parsed.data.customerName).slice(0, 100)
        : undefined,
    };

    const userAgent = req.headers.get("user-agent") ?? undefined;
    const result = await createMidtransPayment({
      ...data,
      meta: { ipAddress: ip, userAgent },
    });

    return ok(result, "Payment berhasil dibuat");
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("orders.create-payment failed", error);
    return fail("Gagal membuat pembayaran", 500);
  }
}
