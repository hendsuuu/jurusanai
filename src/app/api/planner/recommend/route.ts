import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { recommendBusinessSchema } from "@/server/business/schemas";
import { safeParse } from "@/server/utils/validation";
import { sanitizeWizardInput } from "@/server/utils/sanitize";
import { aiGenerateLimiter, rateLimitOrThrow } from "@/server/rate-limit/limiter";
import { getClientIp } from "@/server/rate-limit/keys";
import { createRecommendation } from "@/server/business/recommendation.service";
import { AppError, statusFromErrorMessage } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

// AI recommendation can take 30-90s. User waits on loading screen,
// so this is intentionally synchronous (queue would hurt UX). Vercel
// Pro allows up to 300s; we cap at 120s as a safety belt — anything
// longer than that is almost always a hung OpenAI call.
export const maxDuration = 120;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    await rateLimitOrThrow(aiGenerateLimiter, `planner-recommend:${ip}`);

    const body = await req.json().catch(() => null);
    const parsed = safeParse(recommendBusinessSchema, body);
    if (!parsed.ok) {
      return fail("Input tidak valid", 422, parsed.errors);
    }

    // Sanitize user input before passing to AI prompts
    const sanitizedData = sanitizeWizardInput(parsed.data);

    const userAgent = req.headers.get("user-agent") ?? undefined;
    const result = await createRecommendation(sanitizedData, {
      ipAddress: ip,
      userAgent,
    });

    return ok(result, "Hasil analisis berhasil dibuat");
  } catch (error) {
    if (error instanceof AppError) {
      return fail(error.message, error.status);
    }
    const msg = (error as Error).message;
    const status = statusFromErrorMessage(msg);
    if (status !== 500) return fail(msg, status);
    logger.error("planner.recommend failed", error);
    return fail("Gagal membuat rekomendasi", 500);
  }
}
