import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import { prisma } from "@/lib/prisma";
import { dispatchRegeneratePdf } from "@/inngest/dispatcher";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

/**
 * POST /api/admin/orders/[orderId]/regenerate-pdf
 *
 * Admin-only PDF-only regeneration. Used when the AI plan is fine but the
 * PDF needs to be re-rendered (e.g. template tweak, R2 upload glitch).
 *
 * If the AI plan (`aiPlanJson`) is missing, the pipeline falls back to a
 * full generation — `ensurePlanGeneratedForOrder` inside the Inngest
 * function handles that gracefully.
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
        discoveryResult: {
          select: {
            id: true,
            status: true,
            reportJson: true,
            pdfUrl: true,
          },
        },
      },
    });
    if (!order) return fail("Order tidak ditemukan", 404);

    if (order.status !== "SUCCESS") {
      return fail(
        "Order belum dibayar (status: " + order.status + ")",
        400
      );
    }

    const dispatch = await dispatchRegeneratePdf({
      orderId: order.id,
      discoveryResultId: order.discoveryResultId,
      requestedBy: "admin",
    });

    await prisma.auditLog.create({
      data: {
        action: "REGENERATE_PDF_BY_ADMIN",
        entityType: "Order",
        entityId: order.id,
        userId: session.user.id ?? null,
        metadata: {
          dispatchMode: dispatch.mode,
          eventId: dispatch.eventId ?? null,
          hadAiPlan: Boolean(order.discoveryResult.reportJson),
        },
      },
    });

    logger.info(
      `[admin.regenerate-pdf] Re-queued plan ${order.discoveryResultId} for order ${order.orderCode} (mode=${dispatch.mode})`
    );

    return ok(
      {
        orderId: order.id,
        discoveryResultId: order.discoveryResultId,
        dispatchMode: dispatch.mode,
        eventId: dispatch.eventId ?? null,
      },
      "Regenerate PDF sudah dikirim ke antrean"
    );
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.orders.regenerate-pdf failed", error);
    return fail("Gagal regenerate PDF", 500);
  }
}
