import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import { getOrderDetail } from "@/server/admin/admin.service";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await requireSuperadmin();
    const { orderId } = await params;
    const data = await getOrderDetail(orderId);
    if (!data) return fail("Order tidak ditemukan", 404);

    // Reshape: surface email fields under a dedicated `email` namespace
    // so the admin UI can render delivery state without grovelling raw DB
    // columns. Original flat fields stay accessible via spread.
    const { order, auditLogs } = data;
    const reshaped = {
      order: {
        ...order,
        email: {
          status: order.emailStatus,
          sentAt: order.emailSentAt,
          messageId: order.emailMessageId,
          error: order.emailError,
          attempts: order.emailAttempts,
          to: order.customerEmail,
        },
      },
      auditLogs,
    };

    return ok(reshaped);
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.orders.detail failed", error);
    return fail("Gagal mengambil detail order", 500);
  }
}
