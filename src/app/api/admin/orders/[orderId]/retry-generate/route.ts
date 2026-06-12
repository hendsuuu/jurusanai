import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import { prisma } from "@/lib/prisma";
import { dispatchGenerateBusinessPlan } from "@/inngest/dispatcher";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

/**
 * POST /api/admin/orders/[orderId]/retry-generate
 *
 * Admin-only retry trigger for orders whose post-payment pipeline failed
 * or got stuck. Validates that the order has been paid, then resets the
 * BusinessPlan back to PAID (queued) and dispatches a fresh
 * `business-plan/generate.requested` event to Inngest.
 *
 * Audit trail: logs ADMIN_UPDATE_ORDER with metadata.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await requireSuperadmin();
    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        discoveryResult: { select: { id: true, status: true, pdfUrl: true } },
      },
    });
    if (!order) return fail("Order tidak ditemukan", 404);

    // Only paid orders can trigger generation. Otherwise nothing to retry.
    if (order.status !== "SUCCESS") {
      return fail(
        "Order belum dibayar (status: " + order.status + ")",
        400
      );
    }

    // Reset the plan back to PAID so the pipeline picks it up cleanly.
    // Don't reset if the plan is already PDF_READY — admin should use
    // /regenerate-pdf instead for that case to preserve idempotency.
    const planStatus = order.discoveryResult.status;
    if (planStatus === "PDF_READY" && order.discoveryResult.pdfUrl) {
      return fail(
        "Plan sudah PDF_READY. Gunakan endpoint regenerate-pdf untuk membuat ulang PDF.",
        400
      );
    }

    // GENERATING means a job is currently in flight. Allow retry only if
    // the admin is sure (e.g. the previous run got stuck) — we still
    // reset to PAID so the new event can claim it.
    await prisma.discoveryResult.update({
      where: { id: order.discoveryResultId },
      data: { status: "PAID" },
    });

    const templateId = readOrderTemplateId(order.rawPaymentRequest);
    const dispatch = await dispatchGenerateBusinessPlan({
      orderId: order.id,
      discoveryResultId: order.discoveryResultId,
      templateId,
      retryByAdmin: true,
    });

    await prisma.auditLog.create({
      data: {
        action: "ADMIN_UPDATE_ORDER",
        entityType: "Order",
        entityId: order.id,
        userId: session.user.id ?? null,
        metadata: {
          op: "retry-generate",
          dispatchMode: dispatch.mode,
          eventId: dispatch.eventId ?? null,
          previousDiscoveryStatus: planStatus,
        },
      },
    });

    logger.info(
      `[admin.retry-generate] Re-queued plan ${order.discoveryResultId} for order ${order.orderCode} (mode=${dispatch.mode})`
    );

    return ok(
      {
        orderId: order.id,
        discoveryResultId: order.discoveryResultId,
        dispatchMode: dispatch.mode,
        eventId: dispatch.eventId ?? null,
      },
      "Pipeline business plan sudah dikirim ulang ke antrean"
    );
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.orders.retry-generate failed", error);
    return fail("Gagal retry generate", 500);
  }
}

/**
 * Read the chosen recommendation slug stored on the order at create-payment
 * time. Mirrors the helper used by the webhook handler.
 */
function readOrderTemplateId(rawPaymentRequest: unknown): string | null {
  if (!rawPaymentRequest || typeof rawPaymentRequest !== "object") return null;
  const v = (rawPaymentRequest as { templateId?: unknown }).templateId;
  return typeof v === "string" && v.length > 0 ? v : null;
}
