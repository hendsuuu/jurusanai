import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import { sendPdfReportEmail } from "@/server/email/email.service";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

/**
 * POST /api/admin/orders/[orderId]/resend-email
 *
 * Re-send the PDF report email for a paid order. Requires superadmin
 * session. The order must already have a PDF generated (status PDF_READY)
 * and a customerEmail. Logs an EMAIL_RESEND audit entry and updates
 * Order.email* fields based on the send result.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await requireSuperadmin();
    const { orderId } = await params;

    const result = await sendPdfReportEmail(orderId);

    if (!result.ok) {
      return fail(`Gagal mengirim email: ${result.error}`, 500, result);
    }

    return ok(
      { messageId: result.messageId },
      "Email berhasil dikirim ulang"
    );
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.orders.resend-email failed", error);
    return fail("Gagal mengirim ulang email", 500);
  }
}
