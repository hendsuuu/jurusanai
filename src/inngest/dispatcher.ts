import { prisma } from "@/lib/prisma";
import { inngest, isInngestConfigured, isSyncFallbackAllowed } from "./client";
import { ensurePlanGeneratedForOrder } from "@/server/payment/payment.service";
import { generatePdfForPlan } from "@/server/pdf/pdf.service";
import { sendPdfReportEmail } from "@/server/email/email.service";
import { logger } from "@/server/utils/logger";
import { env } from "@/lib/env";
import { AppError } from "@/server/utils/error";

/**
 * Dispatch a `business-plan/generate.requested` event to Inngest.
 *
 * Behavior:
 * - Production: Inngest is required. Throws if not configured.
 * - Development with INNGEST_EVENT_KEY: dispatches normally to Inngest.
 * - Development without Inngest + ENABLE_SYNC_FALLBACK=true: runs synchronously.
 * - Development without Inngest + no fallback: dispatches anyway (uses Inngest Dev Server).
 */
export async function dispatchGenerateBusinessPlan(args: {
  orderId: string;
  discoveryResultId: string;
  templateId: string | null;
  retryByAdmin?: boolean;
}): Promise<{ mode: "queue" | "sync"; eventId?: string }> {
  if (env.NODE_ENV === "production" && !isInngestConfigured) {
    throw new AppError(
      "INNGEST_NOT_CONFIGURED",
      "Inngest belum dikonfigurasi untuk production",
      500
    );
  }

  // Sync fallback (explicit dev opt-in only)
  if (
    !isInngestConfigured &&
    isSyncFallbackAllowed &&
    env.NODE_ENV !== "production"
  ) {
    logger.warn(
      "[inngest] Running pipeline SYNCHRONOUSLY (ENABLE_SYNC_FALLBACK=true). Use Inngest Dev Server in production-like dev."
    );
    await runPipelineSync(args.orderId, args.discoveryResultId);
    return { mode: "sync" };
  }

  // Queue dispatch (works with both Inngest cloud and local Dev Server)
  const result = await inngest.send({
    name: "business-plan/generate.requested",
    data: {
      orderId: args.orderId,
      discoveryResultId: args.discoveryResultId,
      templateId: args.templateId ?? undefined,
      retryByAdmin: args.retryByAdmin ?? false,
    },
  });

  logger.info(
    `[inngest] Dispatched generate event for order=${args.orderId} plan=${args.discoveryResultId} (eventId=${result.ids[0] ?? "unknown"})`
  );

  return { mode: "queue", eventId: result.ids[0] };
}

/**
 * Dispatch a regeneration event for admin-triggered PDF regeneration.
 */
export async function dispatchRegeneratePdf(args: {
  orderId: string;
  discoveryResultId: string;
  requestedBy: "admin" | "system";
}): Promise<{ mode: "queue" | "sync"; eventId?: string }> {
  if (env.NODE_ENV === "production" && !isInngestConfigured) {
    throw new AppError(
      "INNGEST_NOT_CONFIGURED",
      "Inngest belum dikonfigurasi untuk production",
      500
    );
  }

  if (
    !isInngestConfigured &&
    isSyncFallbackAllowed &&
    env.NODE_ENV !== "production"
  ) {
    logger.warn("[inngest] Running regenerate SYNCHRONOUSLY (fallback)");
    await runPipelineSync(args.orderId, args.discoveryResultId);
    return { mode: "sync" };
  }

  const result = await inngest.send({
    name: "business-plan/pdf.regenerate_requested",
    data: {
      orderId: args.orderId,
      discoveryResultId: args.discoveryResultId,
      requestedBy: args.requestedBy,
    },
  });

  logger.info(
    `[inngest] Dispatched regenerate event for order=${args.orderId} plan=${args.discoveryResultId}`
  );

  return { mode: "queue", eventId: result.ids[0] };
}

/**
 * Synchronous fallback that mirrors the Inngest pipeline.
 * ONLY used in dev with ENABLE_SYNC_FALLBACK=true.
 *
 * This duplicates the pipeline steps because we cannot invoke Inngest
 * functions directly without the Inngest runtime.
 */
async function runPipelineSync(orderId: string, discoveryResultId: string) {
  try {
    // Idempotency check
    const plan = await prisma.discoveryResult.findUnique({
      where: { id: discoveryResultId },
    });
    if (!plan) throw new Error(`Plan ${discoveryResultId} not found`);
    if (plan.status === "PDF_READY" && plan.pdfUrl) {
      logger.info(`[sync] Plan ${discoveryResultId} already complete, skipping`);
      return;
    }

    // Mark GENERATING
    await prisma.discoveryResult.update({
      where: { id: discoveryResultId },
      data: { status: "GENERATING" },
    });

    // AI generation
    await ensurePlanGeneratedForOrder(orderId);

    // PDF render + upload
    const pdf = await generatePdfForPlan(discoveryResultId);
    await prisma.discoveryResult.update({
      where: { id: discoveryResultId },
      data: { status: "PDF_READY", pdfUrl: pdf.url },
    });

    // Email
    try {
      await sendPdfReportEmail(orderId);
    } catch (mailErr) {
      logger.warn("[sync] Email send failed (non-fatal)", mailErr);
    }
  } catch (err) {
    logger.error("[sync] Pipeline failed, marking plan FAILED", err);
    await prisma.discoveryResult
      .update({
        where: { id: discoveryResultId },
        data: { status: "FAILED" },
      })
      .catch(() => {});
    throw err;
  }
}
