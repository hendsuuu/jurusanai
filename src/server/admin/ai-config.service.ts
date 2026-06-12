import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { logger } from "@/server/utils/logger";

export type AiConfig = {
  recommendationProvider: string;
  recommendationModel: string;
  planProvider: string;
  planModel: string;
};

/**
 * Get AI configuration from database settings. Falls back to env vars
 * if DB is unavailable or settings row doesn't exist yet.
 */
export async function getAiConfig(): Promise<AiConfig> {
  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: "singleton" },
      select: {
        aiRecommendationProvider: true,
        aiRecommendationModel: true,
        aiPlanProvider: true,
        aiPlanModel: true,
      },
    });

    if (settings) {
      return {
        recommendationProvider: settings.aiRecommendationProvider,
        recommendationModel: settings.aiRecommendationModel,
        planProvider: settings.aiPlanProvider,
        planModel: settings.aiPlanModel,
      };
    }
  } catch (err) {
    logger.warn("[ai-config] Failed to read settings from DB, using env defaults", err);
  }

  return {
    recommendationProvider: env.AI_PROVIDER,
    recommendationModel: env.AI_RECOMMENDATION_MODEL,
    planProvider: env.AI_PROVIDER,
    planModel: env.AI_PLAN_MODEL,
  };
}
