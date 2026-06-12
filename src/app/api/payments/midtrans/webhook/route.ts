import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { webhookLimiter, rateLimitOrThrow } from "@/server/rate-limit/limiter";
import { getClientIp } from "@/server/rate-limit/keys";
import { handleMidtransWebhook } from "@/server/payment/payment.service";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

// Webhook only updates DB + dispatches Inngest event. Never run AI/PDF here.
// 10s budget is more than enough; keeps Midtrans retry behavior predictable.
export const maxDuration = 10;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    await rateLimitOrThrow(webhookLimiter, `midtrans-webhook:${ip}`);

    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return fail("Payload tidak valid", 400);
    }

    const result = await handleMidtransWebhook(
      payload as Parameters<typeof handleMidtransWebhook>[0]
    );
    return ok(result, "Webhook processed");
  } catch (error) {
    if (error instanceof AppError) {
      // Per Midtrans best practice, return non-2xx ONLY for
      // signature/auth failures, so they can re-deliver. For
      // domain errors return 200 with `success: false`-ish payload —
      // but our spec keeps the standard error response format.
      return fail(error.message, error.status);
    }
    logger.error("midtrans webhook failed", error);
    return fail("Webhook failed", 500);
  }
}
