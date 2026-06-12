import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import { getAppSettings, updateAppSettings } from "@/server/admin/settings.service";
import { clearAllAuditLogs, invalidateAuditLogCache } from "@/server/utils/audit";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

export async function GET(_req: NextRequest) {
  try {
    await requireSuperadmin();
    const data = await getAppSettings();
    return ok(data);
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.settings.get failed", error);
    return fail("Gagal mengambil settings", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireSuperadmin();
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return fail("Body tidak valid", 400);
    }

    // Validate fields
    const allowed: Record<string, "number" | "string" | "boolean"> = {
      pricePremium: "number",
      promoPercentage: "number",
      aiRecommendationProvider: "string",
      aiRecommendationModel: "string",
      aiPlanProvider: "string",
      aiPlanModel: "string",
      auditLogEnabled: "boolean",
    };

    const update: Record<string, unknown> = {};
    for (const [key, type] of Object.entries(allowed)) {
      if (key in body) {
        const val = body[key];
        if (typeof val !== type) {
          return fail(`Field ${key} harus bertipe ${type}`, 422);
        }
        if (type === "number" && (val as number) < 0) {
          return fail(`Field ${key} tidak boleh negatif`, 422);
        }
        update[key] = val;
      }
    }

    if (Object.keys(update).length === 0) {
      return fail("Tidak ada field yang diupdate", 422);
    }

    const data = await updateAppSettings(update as Parameters<typeof updateAppSettings>[0]);

    // Invalidate audit log cache if the toggle was changed
    if ("auditLogEnabled" in update) {
      invalidateAuditLogCache();
    }

    return ok(data, "Settings berhasil diupdate");
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.settings.update failed", error);
    return fail("Gagal mengupdate settings", 500);
  }
}
