import { NonRetriableError } from "inngest";
import { prisma } from "@/lib/prisma";
import { inngest } from "../client";
import { ensurePlanGeneratedForOrder } from "@/server/payment/payment.service";
import { generatePdfForPlan } from "@/server/pdf/pdf.service";
import { sendPdfReportEmail } from "@/server/email/email.service";
import { logger } from "@/server/utils/logger";

/**
 * Multi-step Inngest function that handles the post-payment pipeline:
 *
 *   Step 1 (prepare-order)         → mark plan as GENERATING + idempotency check
 *   Step 2 (generate-ai-content)   → run AI plan generation (retries: 3x)
 *   Step 3 (generate-and-upload)   → render PDF + upload to R2 (retries: 2x)
 *   Step 4 (send-email-and-finish) → email customer + mark COMPLETED (retries: 3x)
 *
 * If any step fails after exhausting retries, the plan is marked FAILED
 * with the error message persisted, and admin can retry via dashboard.
 */
export const generateBusinessPlan = inngest.createFunction(
  {
    id: "generate-business-plan",
    name: "Generate Business Plan PDF",
    concurrency: {
      limit: 2,
    },
    retries: 3,
    onFailure: async ({ event, error }) => {
      // This runs after all retries are exhausted on the function itself.
      // Mark the plan as FAILED so admin can retry from dashboard.
      const eventData = (event.data as { event?: { data?: Record<string, unknown> } }).event?.data
        ?? (event.data as Record<string, unknown>);
      const planId = (eventData as { discoveryResultId?: string }).discoveryResultId;
      if (planId) {
        try {
          await prisma.discoveryResult.update({
            where: { id: planId },
            data: { status: "FAILED" },
          });
          logger.error(
            `[inngest:generateBusinessPlan] Pipeline failed permanently for plan ${planId}: ${error.message}`
          );
        } catch (e) {
          logger.error("[inngest:generateBusinessPlan] Failed to mark plan as FAILED", e);
        }
      }
    },
    triggers: [{ event: "business-plan/generate.requested" }],
  },
  async ({ event, step, logger: stepLogger }) => {
    const { orderId, discoveryResultId } = event.data as {
      orderId: string;
      discoveryResultId: string;
      templateId?: string;
    };

    if (!orderId || !discoveryResultId) {
      throw new NonRetriableError(
        "Event payload missing orderId or discoveryResultId"
      );
    }

    // ── Step 1: Prepare & idempotency check ──────────────────────────
    const prepared = await step.run("prepare-order", async () => {
      const plan = await prisma.discoveryResult.findUnique({
        where: { id: discoveryResultId },
        include: {
          orders: {
            where: { id: orderId },
            select: { id: true, status: true, orderCode: true },
          },
        },
      });

      if (!plan) {
        throw new NonRetriableError(`Plan ${discoveryResultId} not found`);
      }
      if (plan.orders.length === 0) {
        throw new NonRetriableError(
          `Order ${orderId} not associated with plan ${discoveryResultId}`
        );
      }
      if (plan.orders[0].status !== "SUCCESS") {
        throw new NonRetriableError(
          `Order ${orderId} is not SUCCESS (got ${plan.orders[0].status})`
        );
      }

      // Idempotency: already done
      if (plan.status === "PDF_READY" && plan.pdfUrl) {
        stepLogger.info(`Plan ${discoveryResultId} already COMPLETED, skipping`);
        return {
          skip: true as const,
          reason: "ALREADY_COMPLETED" as const,
          pdfUrl: plan.pdfUrl,
          orderCode: plan.orders[0].orderCode,
        };
      }

      // Idempotency: already running (concurrent invocation guard)
      if (plan.status === "GENERATING") {
        stepLogger.warn(`Plan ${discoveryResultId} already GENERATING, skipping`);
        return {
          skip: true as const,
          reason: "ALREADY_GENERATING" as const,
          pdfUrl: null as string | null,
          orderCode: plan.orders[0].orderCode,
        };
      }

      // Mark as GENERATING before any heavy work
      await prisma.discoveryResult.update({
        where: { id: discoveryResultId },
        data: { status: "GENERATING" },
      });

      stepLogger.info(`Plan ${discoveryResultId} marked GENERATING`);
      return {
        skip: false as const,
        reason: null as null,
        pdfUrl: null as string | null,
        orderCode: plan.orders[0].orderCode,
      };
    });

    if (prepared.skip) return { status: prepared.reason, pdfUrl: prepared.pdfUrl };

    // ── Step 2: Generate AI content (idempotent — only runs if not already generated) ──
    await step.run("generate-ai-content", async () => {
      stepLogger.info(`Generating AI content for plan ${discoveryResultId}`);
      await ensurePlanGeneratedForOrder(orderId);
      stepLogger.info(`AI content ready for plan ${discoveryResultId}`);
      return { ok: true };
    });

    // ── Step 3: Render PDF + upload to R2 ────────────────────────────
    const pdfResult = await step.run("generate-and-upload-pdf", async () => {
      stepLogger.info(`Rendering PDF for plan ${discoveryResultId}`);

      // ensurePlanGeneratedForOrder leaves status=PAID; pdf service requires PAID/PDF_READY
      const result = await generatePdfForPlan(discoveryResultId);

      await prisma.discoveryResult.update({
        where: { id: discoveryResultId },
        data: {
          status: "PDF_READY",
          pdfUrl: result.url,
        },
      });

      stepLogger.info(`PDF uploaded for plan ${discoveryResultId}: ${result.url}`);
      return { url: result.url, key: result.key };
    });

    // ── Step 4: Send email (best-effort — failure here doesn't fail the pipeline) ──
    const emailResult = await step.run("send-email-and-complete", async () => {
      try {
        const result = await sendPdfReportEmail(orderId);
        if (!result.ok) {
          stepLogger.warn(
            `Email failed for order ${orderId}: ${result.error}`
          );
          return { sent: false, error: result.error };
        }
        stepLogger.info(`Email sent for order ${orderId}`);
        return { sent: true, messageId: result.messageId };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown email error";
        stepLogger.error(`Email threw for order ${orderId}: ${msg}`);
        return { sent: false, error: msg };
      }
    });

    return {
      status: "COMPLETED",
      pdfUrl: pdfResult.url,
      email: emailResult,
    };
  }
);

/**
 * Handler for admin-triggered PDF regeneration.
 * Reuses the same pipeline — AI step is skipped if already generated.
 */
export const regenerateBusinessPlanPdf = inngest.createFunction(
  {
    id: "regenerate-business-plan-pdf",
    name: "Regenerate Business Plan PDF",
    concurrency: { limit: 2 },
    retries: 2,
    triggers: [{ event: "business-plan/pdf.regenerate_requested" }],
  },
  async ({ event, step, logger: stepLogger }) => {
    const { orderId, discoveryResultId } = event.data as {
      orderId: string;
      discoveryResultId: string;
      requestedBy?: string;
    };

    if (!orderId || !discoveryResultId) {
      throw new NonRetriableError(
        "Regenerate event missing orderId or discoveryResultId"
      );
    }

    // Mark as GENERATING (allow re-run from PDF_READY/FAILED)
    await step.run("mark-regenerating", async () => {
      await prisma.discoveryResult.update({
        where: { id: discoveryResultId },
        data: { status: "GENERATING" },
      });
      stepLogger.info(`Plan ${discoveryResultId} marked GENERATING (regenerate)`);
    });

    // Re-render PDF (AI plan should already exist; ensurePlanGeneratedForOrder is no-op)
    const pdfResult = await step.run("regenerate-pdf", async () => {
      // Make sure AI plan exists; if not, generate it
      await ensurePlanGeneratedForOrder(orderId);

      const result = await generatePdfForPlan(discoveryResultId);
      await prisma.discoveryResult.update({
        where: { id: discoveryResultId },
        data: { status: "PDF_READY", pdfUrl: result.url },
      });
      stepLogger.info(`PDF regenerated: ${result.url}`);
      return { url: result.url, key: result.key };
    });

    // Re-send email
    const emailResult = await step.run("regenerate-send-email", async () => {
      try {
        const result = await sendPdfReportEmail(orderId);
        return result.ok
          ? { sent: true, messageId: result.messageId }
          : { sent: false, error: result.error };
      } catch (err) {
        return {
          sent: false,
          error: err instanceof Error ? err.message : "Unknown email error",
        };
      }
    });

    return { status: "REGENERATED", pdfUrl: pdfResult.url, email: emailResult };
  }
);
