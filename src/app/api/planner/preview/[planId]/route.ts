import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { getPlanPreview } from "@/server/business/plan.service";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const data = await getPlanPreview(planId);
    return ok(data);
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("planner.preview failed", error);
    return fail("Gagal mengambil preview plan", 500);
  }
}
