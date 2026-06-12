import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import { clearAllAuditLogs } from "@/server/utils/audit";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

/**
 * DELETE /api/admin/logs/clear
 *
 * Delete ALL audit log entries. This is irreversible.
 * Used to free up database storage on Neon's limited free tier.
 */
export async function DELETE(_req: NextRequest) {
  try {
    await requireSuperadmin();

    const count = await clearAllAuditLogs();
    logger.info(`[admin] Cleared all audit logs: ${count} entries deleted`);

    return ok({ deleted: count }, `${count} audit log berhasil dihapus`);
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.logs.clear failed", error);
    return fail("Gagal menghapus audit logs", 500);
  }
}
