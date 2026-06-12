import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { createSnapRedirectTransaction } from "./midtrans.service";
import { verifyMidtransSignature } from "./midtrans.validator";
import { selectBusinessIdea } from "@/server/business/plan.service";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";
import { PACKAGE_PRICES, type PackageType as ClientPackageType } from "@/lib/constants";
import type { OrderStatus, PackageType } from "@prisma/client";

/**
 * Re-exported here for legacy callers. Single source of truth lives in
 * `src/lib/constants.ts`. New checkout only sells `PREMIUM`; the DB enum
 * keeps `BASIC` and `PRO` for backward compatibility with historical orders.
 */
export const PACKAGE_PRICES_SERVER: Record<ClientPackageType, number> = PACKAGE_PRICES;

export type CreatePaymentArgs = {
  planId: string;
  /** Recommended business idea slug; used to generate the plan after payment success. */
  templateId: string;
  packageType: ClientPackageType;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  meta?: { ipAddress?: string; userAgent?: string };
};

export async function createMidtransPayment(input: CreatePaymentArgs) {
  const plan = await prisma.discoveryResult.findUnique({
    where: { id: input.planId },
  });

  if (!plan) throw new AppError("PLAN_NOT_FOUND", "Plan tidak ditemukan", 404);

  // Plan must be at least at recommendation stage. The AI business plan is
  // NOT generated until payment succeeds — this saves AI tokens for users
  // who never complete checkout.
  const allowedStatuses = ["RECOMMENDED", "SELECTED", "GENERATED"];
  if (!allowedStatuses.includes(plan.status)) {
    throw new AppError(
      "PLAN_NOT_READY",
      "Plan belum siap untuk pembayaran",
      400
    );
  }

  // The chosen personality result lives in plan.personalityJson. The
  // webhook uses templateId (= personalityId) to generate the full report
  // after success. We extract the personality title now so the admin
  // dashboard can show it immediately at SELECTED status.
  const resolvedIdeaName = recommendationNameOf(
    plan.personalityJson,
    input.templateId
  );

  if (!resolvedIdeaName) {
    throw new AppError(
      "INVALID_TEMPLATE",
      "Hasil kepribadian tidak ditemukan. Ulangi quiz.",
      400
    );
  }

  const { getCurrentPricing, applyPromo } = await import(
    "@/server/admin/pricing.service"
  );
  const pricing = await getCurrentPricing();
  const basePrice = pricing.premium;
  const amount = applyPromo(basePrice, pricing.promoPercentage);
  if (!amount || amount <= 0)
    throw new AppError("INVALID_PACKAGE", "Paket tidak valid", 400);

  const orderCode = `ORDER-${Date.now()}-${nanoid(8)}`;

  const order = await prisma.order.create({
    data: {
      discoveryResultId: plan.id,
      orderCode,
      packageType: input.packageType as PackageType,
      amount,
      status: "PENDING",
      paymentProvider: "MIDTRANS",
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      rawPaymentRequest: {
        planId: plan.id,
        // Persisted here so the webhook can read which idea was chosen
        // when the user paid — avoids needing a separate column.
        templateId: input.templateId,
        packageType: input.packageType,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
      },
    },
  });

  // Mark plan as SELECTED (intent recorded, not yet generated).
  // Save personality identity now so the admin dashboard can show it
  // immediately, even before AI report generation completes after payment.
  if (plan.status === "RECOMMENDED") {
    await prisma.discoveryResult.update({
      where: { id: plan.id },
      data: {
        status: "SELECTED",
        personalityId: input.templateId,
        personalityTitle: resolvedIdeaName,
      },
    });
  } else if (!plan.personalityTitle) {
    // Plan is already past RECOMMENDED but the personality title was never
    // persisted (e.g. legacy data). Backfill it now to keep the dashboard tidy.
    await prisma.discoveryResult.update({
      where: { id: plan.id },
      data: {
        personalityId: input.templateId,
        personalityTitle: resolvedIdeaName,
      },
    });
  }

  const snap = await createSnapRedirectTransaction({
    orderCode,
    amount,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    itemName: "JuruScope - Expert Deep Report",
  });

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentToken: snap.token,
      paymentUrl: snap.redirect_url,
      rawPaymentResponse: snap.raw as unknown as object,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "CREATE_ORDER",
      entityType: "Order",
      entityId: updated.id,
      ipAddress: input.meta?.ipAddress,
      userAgent: input.meta?.userAgent,
      metadata: {
        planId: plan.id,
        templateId: input.templateId,
        packageType: input.packageType,
        amount,
      },
    },
  });

  return {
    orderId: updated.id,
    orderCode: updated.orderCode,
    amount: updated.amount,
    status: updated.status,
    paymentToken: updated.paymentToken,
    paymentUrl: updated.paymentUrl,
  };
}

/**
 * Find the chosen personality result in `recommendationJson` and return
 * its display title. Returns `null` if not found.
 */
function recommendationNameOf(
  recommendationJson: unknown,
  templateId: string
): string | null {
  if (!recommendationJson || typeof recommendationJson !== "object") return null;
  const data = recommendationJson as {
    result?: { personalityId?: string; personalityTitle?: string };
  };
  const result = data.result;
  if (!result) return null;
  // Match on the stored personalityId; if absent, accept the stored result.
  if (result.personalityId && result.personalityId !== templateId) {
    // Still return the title — the plan only ever has one personality result.
    return result.personalityTitle ?? null;
  }
  return result.personalityTitle ?? null;
}

export async function getOrderPublic(orderId: string) {
  const order = await prisma.order.findUnique({
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
  if (!order) throw new AppError("ORDER_NOT_FOUND", "Order tidak ditemukan", 404);

  const pdfReady = order.discoveryResult.status === "PDF_READY" && Boolean(order.discoveryResult.pdfUrl);

  return {
    orderId: order.id,
    orderCode: order.orderCode,
    status: order.status,
    amount: order.amount,
    packageType: order.packageType,
    planId: order.discoveryResultId,
    paymentUrl: order.paymentUrl,
    expiredAt: order.expiredAt?.toISOString() ?? null,
    discoveryResult: {
      id: order.discoveryResult.id,
      status: order.discoveryResult.status,
      pdfReady,
      pdfUrl: pdfReady ? `/api/pdf/download/${order.discoveryResult.id}` : null,
      selectedIdeaName: order.discoveryResult.personalityTitle,
    },
  };
}

// ───── Webhook handler ────────────────────────────────────────────────────

type MidtransWebhookPayload = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  transaction_id?: string;
  fraud_status?: string;
  payment_type?: string;
  [key: string]: unknown;
};

function mapTransactionStatus(
  payload: MidtransWebhookPayload
): OrderStatus {
  const t = payload.transaction_status;
  const f = payload.fraud_status;

  if (t === "capture") return f === "accept" ? "SUCCESS" : "PENDING";
  if (t === "settlement") return "SUCCESS";
  if (t === "deny") return "FAILED";
  if (t === "cancel") return "CANCELED";
  if (t === "expire") return "EXPIRED";
  return "PENDING";
}

export async function handleMidtransWebhook(payload: MidtransWebhookPayload) {
  const valid = verifyMidtransSignature(
    {
      order_id: payload.order_id,
      status_code: payload.status_code,
      gross_amount: payload.gross_amount,
    },
    payload.signature_key
  );
  if (!valid) {
    throw new AppError("INVALID_SIGNATURE", "Signature webhook tidak valid", 401);
  }

  const order = await prisma.order.findUnique({
    where: { orderCode: payload.order_id },
    include: { discoveryResult: true },
  });
  if (!order) throw new AppError("ORDER_NOT_FOUND", "Order tidak ditemukan", 404);

  // Idempotency: already finalized & PDF ready → just acknowledge.
  if (
    order.status === "SUCCESS" &&
    order.discoveryResult.pdfUrl &&
    order.discoveryResult.status === "PDF_READY"
  ) {
    return {
      orderId: order.id,
      orderCode: order.orderCode,
      status: order.status,
      message: "Already processed",
    };
  }

  const nextStatus = mapTransactionStatus(payload);

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: nextStatus,
      rawWebhookPayload: payload as unknown as object,
      providerReference: payload.transaction_id ?? order.providerReference,
      paidAt: nextStatus === "SUCCESS" ? new Date() : order.paidAt,
    },
  });

  if (nextStatus === "SUCCESS") {
    await prisma.discoveryResult.update({
      where: { id: order.discoveryResultId },
      data: { status: "PAID" },
    });

    // Dispatch background job to Inngest. The pipeline (AI plan → PDF → email)
    // runs asynchronously so this webhook responds quickly to Midtrans.
    try {
      const { dispatchGenerateBusinessPlan } = await import(
        "@/inngest/dispatcher"
      );
      const templateId = readOrderTemplateId(order.rawPaymentRequest);
      const dispatch = await dispatchGenerateBusinessPlan({
        orderId: order.id,
        discoveryResultId: order.discoveryResultId,
        templateId,
      });
      logger.info(
        `[payment] Pipeline dispatched (${dispatch.mode}) for order ${order.orderCode}`
      );
    } catch (err) {
      logger.error("[payment] Failed to dispatch generate event", err);
      // Mark plan FAILED so admin can retry from dashboard
      await prisma.discoveryResult
        .update({
          where: { id: order.discoveryResultId },
          data: { status: "FAILED" },
        })
        .catch(() => {});
    }

    await prisma.auditLog.create({
      data: {
        action: "PAYMENT_SUCCESS",
        entityType: "Order",
        entityId: order.id,
        metadata: payload as unknown as object,
      },
    });
  } else if (nextStatus === "FAILED") {
    await prisma.auditLog.create({
      data: {
        action: "PAYMENT_FAILED",
        entityType: "Order",
        entityId: order.id,
        metadata: payload as unknown as object,
      },
    });
  } else if (nextStatus === "EXPIRED") {
    await prisma.auditLog.create({
      data: {
        action: "PAYMENT_EXPIRED",
        entityType: "Order",
        entityId: order.id,
        metadata: payload as unknown as object,
      },
    });
  } else if (nextStatus === "CANCELED") {
    await prisma.auditLog.create({
      data: {
        action: "PAYMENT_CANCELED",
        entityType: "Order",
        entityId: order.id,
        metadata: payload as unknown as object,
      },
    });
  }

  return {
    orderId: updated.id,
    orderCode: updated.orderCode,
    status: updated.status,
  };
}

// ───── Plan generation helpers (post-payment) ─────────────────────────────

/**
 * Public wrapper around `ensurePlanGenerated` for callers outside the
 * webhook flow (e.g. the localhost `check-status` fallback).
 */
export async function ensurePlanGeneratedForOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      discoveryResultId: true,
      rawPaymentRequest: true,
    },
  });
  if (!order) throw new AppError("ORDER_NOT_FOUND", "Order tidak ditemukan", 404);
  const templateId = readOrderTemplateId(order.rawPaymentRequest);
  return ensurePlanGenerated(order.discoveryResultId, templateId);
}

/**
 * Read the chosen recommendation slug stored on the order at create-payment
 * time. We persist it inside `rawPaymentRequest` to avoid adding a new DB
 * column. Falls back to the plan's existing `selectedTemplateId` if absent.
 */
function readOrderTemplateId(rawPaymentRequest: unknown): string | null {
  if (!rawPaymentRequest || typeof rawPaymentRequest !== "object") return null;
  const v = (rawPaymentRequest as { templateId?: unknown }).templateId;
  return typeof v === "string" && v.length > 0 ? v : null;
}

/**
 * Ensure the BusinessPlan has its AI-generated content. If `aiPlanJson`
 * is already present, returns the plan as-is. Otherwise runs
 * `selectBusinessIdea` for the given templateId to populate
 * `financialJson` + `aiPlanJson` and set status to GENERATED.
 *
 * After this call the plan is reset to PAID (so generatePdfForPlan
 * accepts it). The webhook then sets it to PDF_READY on success.
 */
async function ensurePlanGenerated(planId: string, templateId: string | null) {
  const plan = await prisma.discoveryResult.findUnique({ where: { id: planId } });
  if (!plan) throw new AppError("PLAN_NOT_FOUND", "Plan tidak ditemukan", 404);

  // Already generated — nothing to do.
  if (plan.reportJson) {
    // Make sure status is PAID for the PDF generator.
    if (plan.status !== "PAID" && plan.status !== "PDF_READY") {
      await prisma.discoveryResult.update({
        where: { id: planId },
        data: { status: "PAID" },
      });
    }
    return plan;
  }

  const chosenTemplate = templateId ?? plan.personalityId;
  if (!chosenTemplate) {
    throw new AppError(
      "INVALID_TEMPLATE",
      "Personality tidak ditemukan untuk generate report",
      400
    );
  }

  logger.info(
    `[payment] Generating self discovery report after payment success: planId=${planId}, personalityId=${chosenTemplate}`
  );

  // Run the select-personality pipeline. It will:
  //  - resolve the stored personality teaser
  //  - run the AI report generator
  //  - persist reportJson
  //  - set status to GENERATED
  await selectBusinessIdea({
    planId,
    templateId: chosenTemplate,
    meta: { ipAddress: undefined, userAgent: "midtrans-webhook" },
  });

  // Re-set status to PAID so generatePdfForPlan accepts it.
  const updated = await prisma.discoveryResult.update({
    where: { id: planId },
    data: { status: "PAID" },
  });

  await prisma.auditLog.create({
    data: {
      action: "GENERATE_REPORT",
      entityType: "DiscoveryResult",
      entityId: planId,
      metadata: { personalityId: chosenTemplate, trigger: "post-payment" },
    },
  });

  return updated;
}
