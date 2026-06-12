import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { selectBusinessIdeaSchema } from "@/server/business/schemas";
import { safeParse } from "@/server/utils/validation";
import { selectIdeaLimiter, rateLimitOrThrow } from "@/server/rate-limit/limiter";
import { getClientIp } from "@/server/rate-limit/keys";
import { selectBusinessIdea } from "@/server/business/plan.service";
import { AppError, statusFromErrorMessage } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

// Generate full AI plan + financial projection. User waits on the
// preview page, so it has to be synchronous. Cap at 180s — full plan
// generation is heavier than recommendation (web research + plan AI).
export const maxDuration = 180;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    await rateLimitOrThrow(selectIdeaLimiter, `planner-select-idea:${ip}`);

    const body = await req.json().catch(() => null);
    const parsed = safeParse(selectBusinessIdeaSchema, body);
    if (!parsed.ok) {
      return fail("Input tidak valid", 422, parsed.errors);
    }

    const userAgent = req.headers.get("user-agent") ?? undefined;
    const result = await selectBusinessIdea({
      planId: parsed.data.planId,
      templateId: parsed.data.templateId,
      meta: { ipAddress: ip, userAgent },
    });

    return ok(result, "Self discovery report berhasil dibuat");
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    const msg = (error as Error).message;
    const status = statusFromErrorMessage(msg);
    if (status !== 500) return fail(msg, status);
    logger.error("planner.select-idea failed", error);
    return fail("Gagal memilih ide bisnis", 500);
  }
}
