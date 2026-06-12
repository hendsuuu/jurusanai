import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/server/auth/guard";
import { generatePdfForPlan } from "@/server/pdf/pdf.service";
import { sendPdfReportEmail } from "@/server/email/email.service";
import { rateLimitOrThrow, aiGenerateLimiter } from "@/server/rate-limit/limiter";
import { getClientIp } from "@/server/rate-limit/keys";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

/**
 * POST /api/pdf/generate/[planId]
 *
 * Manually re-generate a PDF for a paid plan. REQUIRES SUPERADMIN AUTH.
 * After successful generation, automatically sends the PDF email to the
 * customer and logs the action as "REGENERATE_PDF_BY_ADMIN".
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    // Auth: require superadmin session
    await requireSuperadmin();

    // Rate limit: prevent abuse even from admin
    const ip = getClientIp(req);
    await rateLimitOrThrow(aiGenerateLimiter, `pdf-regenerate:${ip}`);

    const { planId } = await params;
    const plan = await prisma.discoveryResult.findUnique({
      where: { id: planId },
      include: { orders: { where: { status: "SUCCESS" }, take: 1 } },
    });
    if (!plan) return fail("Plan tidak ditemukan", 404);

    const paidOrder = plan.orders[0];
    if (!paidOrder) {
      return fail("Belum ada order sukses untuk plan ini", 403);
    }

    // Generate PDF
    const result = await generatePdfForPlan(planId);

    // Update plan status
    await prisma.discoveryResult.update({
      where: { id: planId },
      data: { pdfUrl: result.url, status: "PDF_READY" },
    });

    // Automatically send email to customer
    let emailResult: { ok: boolean; error?: string; messageId?: string | null } = { ok: false, error: "Skipped" };
    try {
      const sendResult = await sendPdfReportEmail(paidOrder.id);
      if (sendResult.ok) {
        emailResult = { ok: true, messageId: sendResult.messageId };
        logger.info(`[pdf-regenerate] Email sent to customer for order ${paidOrder.orderCode}`);
      } else {
        emailResult = { ok: false, error: sendResult.error };
        logger.warn(`[pdf-regenerate] Email failed for order ${paidOrder.orderCode}: ${sendResult.error}`);
      }
    } catch (emailErr) {
      const msg = emailErr instanceof Error ? emailErr.message : "Unknown email error";
      emailResult = { ok: false, error: msg };
      logger.error("[pdf-regenerate] Email send threw", emailErr);
    }

    return ok(
      { ...result, email: emailResult },
      emailResult.ok
        ? "PDF berhasil digenerate dan email terkirim"
        : `PDF berhasil digenerate, tapi email gagal: ${emailResult.error}`
    );
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("pdf.generate failed", error);
    return fail("Gagal generate PDF", 500);
  }
}
