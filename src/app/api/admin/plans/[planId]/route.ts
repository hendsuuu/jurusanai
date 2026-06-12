import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

/**
 * GET /api/admin/plans/[planId]
 *
 * Returns full business plan detail including projection JSON, AI plan
 * narration, and related orders. Used by the admin plan detail page
 * (TanStack Query-cached).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    await requireSuperadmin();
    const { planId } = await params;

    const plan = await prisma.discoveryResult.findUnique({
      where: { id: planId },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderCode: true,
            packageType: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!plan) return fail("Plan tidak ditemukan", 404);

    return ok({ plan });
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.plan-detail failed", error);
    return fail("Gagal mengambil detail plan", 500);
  }
}
