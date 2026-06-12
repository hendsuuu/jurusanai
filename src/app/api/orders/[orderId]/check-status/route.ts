import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { prisma } from "@/lib/prisma";
import { checkMidtransTransactionStatus } from "@/server/payment/midtrans.status";
import { handleMidtransWebhook } from "@/server/payment/payment.service";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

/**
 * GET /api/orders/[orderId]/check-status
 *
 * Server-side check of Midtrans transaction status.
 * This is the fallback for localhost development where Midtrans
 * cannot send webhooks. In production, the webhook handles this
 * automatically.
 *
 * Flow:
 * 1. Look up order in DB
 * 2. If already SUCCESS/FAILED/EXPIRED/CANCELED, return current status
 * 3. If PENDING, call Midtrans Core API to check real status
 * 4. If Midtrans says settlement/capture, process it like a webhook
 * 5. Return updated status
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        discoveryResult: {
          select: { id: true, status: true, pdfUrl: true, personalityTitle: true },
        },
      },
    });

    if (!order) return fail("Order tidak ditemukan", 404);

    const baseResponse = {
      orderId: order.id,
      orderCode: order.orderCode,
      amount: order.amount,
      packageType: order.packageType,
      planId: order.discoveryResultId,
      paymentUrl: order.paymentUrl,
      expiredAt: order.expiredAt?.toISOString() ?? null,
    };

    // Already finalized — no need to check Midtrans
    if (order.status !== "PENDING") {
      const pdfReady =
        order.discoveryResult.status === "PDF_READY" &&
        Boolean(order.discoveryResult.pdfUrl);
      return ok({
        ...baseResponse,
        status: order.status,
        discoveryResult: {
          id: order.discoveryResult.id,
          status: order.discoveryResult.status,
          pdfReady,
          pdfUrl: pdfReady
            ? `/api/pdf/download/${order.discoveryResult.id}`
            : null,
          selectedIdeaName: order.discoveryResult.personalityTitle,
        },
      });
    }

    // Check Midtrans directly
    const midtransStatus = await checkMidtransTransactionStatus(
      order.orderCode
    );

    if (!midtransStatus) {
      // Transaction not found or error — still pending
      return ok({
        ...baseResponse,
        status: "PENDING",
        discoveryResult: {
          id: order.discoveryResult.id,
          status: order.discoveryResult.status,
          pdfReady: false,
          pdfUrl: null,
          selectedIdeaName: order.discoveryResult.personalityTitle,
        },
        midtransChecked: true,
        midtransResult: null,
      });
    }

    const txStatus = midtransStatus.transaction_status;
    const isSettled =
      txStatus === "settlement" ||
      txStatus === "capture" ||
      txStatus === "deny" ||
      txStatus === "cancel" ||
      txStatus === "expire";

    if (isSettled) {
      // Process it like a webhook payload
      logger.info(
        `[check-status] Midtrans says ${txStatus} for ${order.orderCode}, processing...`
      );

      try {
        await handleMidtransWebhook({
          order_id: midtransStatus.order_id,
          status_code: midtransStatus.status_code,
          gross_amount: midtransStatus.gross_amount,
          signature_key: midtransStatus.signature_key,
          transaction_status: midtransStatus.transaction_status,
          transaction_id: midtransStatus.transaction_id,
          fraud_status: midtransStatus.fraud_status,
          payment_type: midtransStatus.payment_type,
        });
      } catch (err) {
        // Signature might fail if Midtrans status response has different
        // signature format. In that case, do a direct DB update.
        logger.warn(
          `[check-status] Webhook handler failed for ${order.orderCode}, doing direct update`,
          err
        );
        await directStatusUpdate(order.id, order.discoveryResultId, txStatus);
      }

      // Re-fetch updated order
      const updated = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          discoveryResult: {
            select: {
              id: true,
              status: true,
              pdfUrl: true,
              personalityTitle: true,
            },
          },
        },
      });

      if (updated) {
        const pdfReady =
          updated.discoveryResult.status === "PDF_READY" &&
          Boolean(updated.discoveryResult.pdfUrl);
        return ok({
          orderId: updated.id,
          orderCode: updated.orderCode,
          status: updated.status,
          amount: updated.amount,
          packageType: updated.packageType,
          planId: updated.discoveryResultId,
          paymentUrl: updated.paymentUrl,
          expiredAt: updated.expiredAt?.toISOString() ?? null,
          discoveryResult: {
            id: updated.discoveryResult.id,
            status: updated.discoveryResult.status,
            pdfReady,
            pdfUrl: pdfReady
              ? `/api/pdf/download/${updated.discoveryResult.id}`
              : null,
            selectedIdeaName: updated.discoveryResult.personalityTitle,
          },
          midtransChecked: true,
          midtransTransactionStatus: txStatus,
        });
      }
    }

    // Midtrans says pending too
    return ok({
      ...baseResponse,
      status: "PENDING",
      discoveryResult: {
        id: order.discoveryResult.id,
        status: order.discoveryResult.status,
        pdfReady: false,
        pdfUrl: null,
        selectedIdeaName: order.discoveryResult.personalityTitle,
      },
      midtransChecked: true,
      midtransTransactionStatus: txStatus,
    });
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("orders.check-status failed", error);
    return fail("Gagal mengecek status", 500);
  }
}

/**
 * Direct DB update when webhook handler fails (e.g. signature mismatch in
 * Midtrans status response). Updates status immediately, then dispatches
 * the same Inngest pipeline used by the real webhook so the user keeps a
 * consistent flow regardless of which path settled the payment.
 */
async function directStatusUpdate(
  orderId: string,
  discoveryResultId: string,
  txStatus: string
) {
  let dbStatus: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "CANCELED" =
    "PENDING";
  if (txStatus === "settlement" || txStatus === "capture") dbStatus = "SUCCESS";
  else if (txStatus === "deny") dbStatus = "FAILED";
  else if (txStatus === "cancel") dbStatus = "CANCELED";
  else if (txStatus === "expire") dbStatus = "EXPIRED";

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: dbStatus,
      paidAt: dbStatus === "SUCCESS" ? new Date() : undefined,
    },
  });

  if (dbStatus === "SUCCESS") {
    await prisma.discoveryResult.update({
      where: { id: discoveryResultId },
      data: { status: "PAID" },
    });

    // Dispatch the same Inngest pipeline the real webhook would have used.
    // We read the templateId off the order so the AI generator picks the
    // right idea — same source of truth as the webhook.
    try {
      const { dispatchGenerateBusinessPlan } = await import(
        "@/inngest/dispatcher"
      );
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { rawPaymentRequest: true },
      });
      const templateId = readTemplateIdFromRaw(order?.rawPaymentRequest);
      const dispatch = await dispatchGenerateBusinessPlan({
        orderId,
        discoveryResultId,
        templateId,
      });
      logger.info(
        `[check-status] Pipeline dispatched (${dispatch.mode}) for order=${orderId} via direct fallback`
      );
    } catch (err) {
      logger.error(
        "[check-status] Failed to dispatch generate event after direct update",
        err
      );
    }

    await prisma.auditLog.create({
      data: {
        action: "PAYMENT_SUCCESS",
        entityType: "Order",
        entityId: orderId,
        metadata: { source: "check-status", txStatus },
      },
    });
  }
}

function readTemplateIdFromRaw(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const v = (raw as { templateId?: unknown }).templateId;
  return typeof v === "string" && v.length > 0 ? v : null;
}
