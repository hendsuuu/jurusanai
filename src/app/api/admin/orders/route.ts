import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import { listOrders } from "@/server/admin/admin.service";
import { paginationSchema } from "@/server/utils/validation";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";
import type { OrderStatus } from "@prisma/client";

const VALID_STATUSES: OrderStatus[] = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "EXPIRED",
  "CANCELED",
];

export async function GET(req: NextRequest) {
  try {
    await requireSuperadmin();

    const sp = req.nextUrl.searchParams;
    const pagination = paginationSchema.safeParse({
      page: sp.get("page") ?? undefined,
      limit: sp.get("limit") ?? undefined,
    });
    if (!pagination.success) return fail("Pagination tidak valid", 422);

    const statusRaw = sp.get("status") ?? undefined;
    const status =
      statusRaw && VALID_STATUSES.includes(statusRaw as OrderStatus)
        ? (statusRaw as OrderStatus)
        : undefined;
    const search = sp.get("search") ?? undefined;

    const data = await listOrders({
      page: pagination.data.page,
      limit: pagination.data.limit,
      status,
      search: search ?? undefined,
    });

    return ok(data);
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.orders failed", error);
    return fail("Gagal mengambil daftar order", 500);
  }
}
