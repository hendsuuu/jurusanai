import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { logger } from "@/server/utils/logger";
import { AppError } from "@/server/utils/error";
import { getResendClient } from "./resend.client";
import {
  pdfReportHtml,
  pdfReportPlainText,
  pdfReportSubject,
} from "./templates";

export type SendPdfReportResult =
  | {
      ok: true;
      messageId: string | null;
    }
  | {
      ok: false;
      error: string;
    };

/**
 * Send the generated PDF report to the customer for a paid Order.
 * Persists delivery state on the order:
 *   emailStatus, emailSentAt, emailMessageId, emailError, emailAttempts.
 *
 * Always increments `emailAttempts`. Catches all errors so the caller
 * (webhook / admin resend) doesn't fail when the email provider is down.
 */
export async function sendPdfReportEmail(
  orderId: string
): Promise<SendPdfReportResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      discoveryResult: {
        select: {
          id: true,
          personalityTitle: true,
          pdfUrl: true,
          status: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError("ORDER_NOT_FOUND", "Order tidak ditemukan", 404);
  }

  const customerEmail = order.customerEmail;
  if (!customerEmail) {
    return persistFailure(orderId, "Email customer tidak tersedia");
  }

  if (
    !order.discoveryResult ||
    order.discoveryResult.status !== "PDF_READY" ||
    !order.discoveryResult.pdfUrl
  ) {
    return persistFailure(orderId, "PDF belum siap untuk dikirim");
  }

  const resend = getResendClient();
  if (!resend) {
    logger.warn(
      "[email] RESEND_API_KEY not configured — skipping send for order " +
        order.orderCode
    );
    return persistFailure(orderId, "RESEND_API_KEY belum dikonfigurasi");
  }

  const siteUrl = env.APP_URL.replace(/\/$/, "");
  const pdfUrl = `${siteUrl}/api/pdf/download/${order.discoveryResult.id}`;

  const params = {
    customerName: order.customerName,
    businessIdeaName: order.discoveryResult.personalityTitle,
    packageType: order.packageType as "BASIC" | "PREMIUM" | "PRO",
    amount: order.amount,
    orderCode: order.orderCode,
    pdfUrl,
    siteUrl,
  };

  const subject = pdfReportSubject(params);
  const html = pdfReportHtml(params);
  const text = pdfReportPlainText(params);

  // ── Email mode (dev vs prod) ───────────────────────────────────────
  // The recipient is ALWAYS the actual buyer's email — both in dev and
  // prod. The only thing that differs is the SENDER:
  //
  //   - Dev mode  → "onboarding@resend.dev"  (Resend's universal sender;
  //                 works without verifying our domain)
  //   - Prod mode → env.RESEND_FROM_EMAIL    (must be a verified domain)
  //
  // Two signals turn on dev-mode:
  //   1. EMAIL_DEV_MODE explicitly set to "true" or "false" (overrides everything)
  //   2. NODE_ENV !== "production"  (Next.js auto-sets this to "production"
  //      after `next build`; in `next dev` it stays "development")
  //
  // Note for dev: Resend's free tier requires the `onboarding@resend.dev`
  // sender to deliver to either `delivered@resend.dev` (always-deliver
  // sink) OR an email address on the account owner's verified domain.
  // Sending to arbitrary recipients while still on the free/unverified
  // tier may result in a 403 from Resend even with this sender. To keep
  // dev testing flexible without hitting that limit, set `EMAIL_DEV_MODE`
  // to "false" once your domain is verified, or use the admin's
  // "kirim ulang" feature to retry after verification.
  const isDevMode =
    env.EMAIL_DEV_MODE !== undefined
      ? env.EMAIL_DEV_MODE
      : env.NODE_ENV !== "production";

  const fromAddress = isDevMode
    ? "JuruScope <onboarding@resend.dev>"
    : env.RESEND_FROM_EMAIL;
  // Always send to the real customer email. The previous redirect to
  // `delivered@resend.dev` was incorrect — buyers should always receive
  // the report directly, regardless of environment.
  const toAddress = customerEmail;
  const subjectFinal = subject;

  logger.info(
    `[email] sending. mode=${isDevMode ? "dev" : "prod"} from="${fromAddress}" to="${toAddress}"`
  );

  try {
    const response = await resend.emails.send({
      from: fromAddress,
      to: toAddress,
      subject: subjectFinal,
      html,
      text,
      // Resend supports tags for filtering in their dashboard
      tags: [
        { name: "type", value: "pdf-report" },
        { name: "package", value: order.packageType },
        { name: "mode", value: isDevMode ? "dev" : "prod" },
      ],
    });

    if (response.error) {
      logger.error("[email] Resend API returned error", response.error);
      return persistFailure(orderId, response.error.message);
    }

    const messageId = response.data?.id ?? null;
    await prisma.order.update({
      where: { id: orderId },
      data: {
        emailStatus: "SENT",
        emailSentAt: new Date(),
        emailMessageId: messageId,
        emailError: null,
        emailAttempts: { increment: 1 },
      },
    });
    await prisma.auditLog.create({
      data: {
        action: "EMAIL_SENT",
        entityType: "Order",
        entityId: orderId,
        metadata: { messageId, to: customerEmail },
      },
    });

    return { ok: true, messageId };
  } catch (err) {
    logger.error("[email] Resend send threw", err);
    const message =
      err instanceof Error ? err.message : "Unknown email send error";
    return persistFailure(orderId, message);
  }
}

async function persistFailure(
  orderId: string,
  message: string
): Promise<SendPdfReportResult> {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      emailStatus: "FAILED",
      emailError: message,
      emailAttempts: { increment: 1 },
    },
  });
  await prisma.auditLog.create({
    data: {
      action: "EMAIL_FAILED",
      entityType: "Order",
      entityId: orderId,
      metadata: { error: message },
    },
  });
  return { ok: false, error: message };
}
