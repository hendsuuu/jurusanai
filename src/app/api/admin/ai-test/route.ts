import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";
import { env } from "@/lib/env";
import { getAiConfig } from "@/server/admin/ai-config.service";

export const maxDuration = 60;
export const runtime = "nodejs";

/**
 * POST /api/admin/ai-test
 *
 * Runs a minimal OpenAI call with the currently configured model and
 * returns timing, model info, and a snippet of the output so you can
 * verify the AI pipeline is wired up correctly in production.
 *
 * Returns:
 *   { provider, model, keyPresent, success, durationMs, snippet?, error? }
 */
export async function POST(_req: NextRequest) {
  try {
    await requireSuperadmin();

    const config = await getAiConfig();
    const keyPresent = Boolean(env.OPENAI_API_KEY);

    const result: Record<string, unknown> = {
      provider: config.recommendationProvider,
      model: config.recommendationModel,
      keyPresent,
      nodeEnv: env.NODE_ENV,
    };

    if (config.recommendationProvider !== "openai") {
      return ok({
        ...result,
        success: false,
        error: `Provider adalah '${config.recommendationProvider}', bukan 'openai'. Ubah AI_PROVIDER=openai di environment variables.`,
      });
    }

    if (!keyPresent) {
      return ok({
        ...result,
        success: false,
        error: "OPENAI_API_KEY tidak ditemukan di environment variables.",
      });
    }

    const start = Date.now();

    try {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

      const isReasoningModel = /^o\d/i.test(config.recommendationModel);

      const params: Record<string, unknown> = {
        model: config.recommendationModel,
        messages: [
          {
            role: "system",
            content: 'You are a JSON API. Respond only with valid JSON.',
          },
          {
            role: "user",
            content: 'Respond with: {"status":"ok","message":"AI test berhasil"}',
          },
        ],
        max_completion_tokens: 100,
      };
      if (!isReasoningModel) params.response_format = { type: "json_object" };

      const response = (await openai.chat.completions.create(
        params as unknown as Parameters<typeof openai.chat.completions.create>[0]
      )) as unknown as {
        choices: Array<{ message: { content: string | null }; finish_reason: string }>;
        model: string;
        usage?: { total_tokens: number };
      };

      const durationMs = Date.now() - start;
      const content = response.choices[0]?.message?.content ?? "";

      logger.info(`[ai-test] success in ${durationMs}ms — model=${response.model}`);

      return ok({
        ...result,
        success: true,
        durationMs,
        resolvedModel: response.model,
        finishReason: response.choices[0]?.finish_reason,
        totalTokens: response.usage?.total_tokens,
        snippet: content.slice(0, 200),
      });
    } catch (err) {
      const durationMs = Date.now() - start;
      const msg = err instanceof Error ? err.message : String(err);
      const status = (err as { status?: number }).status;

      logger.error(`[ai-test] OpenAI call failed — ${msg}`);

      return ok({
        ...result,
        success: false,
        durationMs,
        error: msg,
        httpStatus: status,
        hint: diagnoseError(msg, status),
      });
    }
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.ai-test failed", error);
    return fail("AI test gagal", 500);
  }
}

function diagnoseError(msg: string, status?: number): string {
  if (status === 401) return "API key tidak valid atau sudah expired.";
  if (status === 404) return "Model tidak ditemukan. Cek nama model di AI_RECOMMENDATION_MODEL.";
  if (status === 429) return "Rate limit atau quota OpenAI habis.";
  if (status === 400) return "Request tidak valid — kemungkinan parameter tidak didukung model ini.";
  if (msg.includes("timeout") || msg.includes("ETIMEDOUT")) return "Request timeout. Coba naikkan maxDuration atau gunakan model yang lebih cepat.";
  return "Cek Vercel function logs untuk detail lebih lanjut.";
}
