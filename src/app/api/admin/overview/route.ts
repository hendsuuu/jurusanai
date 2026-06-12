import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import { getOverview } from "@/server/admin/admin.service";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

export async function GET(_req: NextRequest) {
  try {
    await requireSuperadmin();
    const data = await getOverview();
    return ok(data);
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.overview failed", error);
    return fail("Gagal mengambil overview", 500);
  }
}
