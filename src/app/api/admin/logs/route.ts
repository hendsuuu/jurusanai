import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import { listLogs } from "@/server/admin/admin.service";
import { paginationSchema } from "@/server/utils/validation";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";
import type { AuditAction } from "@prisma/client";

const VALID_ACTIONS: AuditAction[] = [
  "LOGIN",
  "LOGOUT",
  "CREATE_RECOMMENDATION",
  "SELECT_PERSONALITY",
  "GENERATE_REPORT",
  "CREATE_ORDER",
  "PAYMENT_SUCCESS",
  "PAYMENT_FAILED",
  "PAYMENT_EXPIRED",
  "PAYMENT_CANCELED",
  "GENERATE_PDF",
  "DOWNLOAD_PDF",
  "ADMIN_VIEW_ORDER",
  "ADMIN_UPDATE_ORDER",
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

    const actionRaw = sp.get("action") ?? undefined;
    const action =
      actionRaw && VALID_ACTIONS.includes(actionRaw as AuditAction)
        ? (actionRaw as AuditAction)
        : undefined;
    const entityType = sp.get("entityType") ?? undefined;
    const entityId = sp.get("entityId") ?? undefined;

    const data = await listLogs({
      page: pagination.data.page,
      limit: pagination.data.limit,
      action,
      entityType: entityType ?? undefined,
      entityId: entityId ?? undefined,
    });

    return ok(data);
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.logs failed", error);
    return fail("Gagal mengambil log", 500);
  }
}
