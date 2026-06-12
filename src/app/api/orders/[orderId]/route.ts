import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { getOrderPublic } from "@/server/payment/payment.service";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const data = await getOrderPublic(orderId);
    return ok(data);
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("orders.get failed", error);
    return fail("Gagal mengambil order", 500);
  }
}
