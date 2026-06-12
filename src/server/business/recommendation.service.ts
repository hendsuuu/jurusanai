import { prisma } from "@/lib/prisma";
import { generateRecommendations } from "@/server/ai/client";
import { cacheGet, cacheSet, makeCacheKey } from "@/server/cache/redis-cache";
import { logger } from "@/server/utils/logger";
import type { RecommendBusinessInput } from "./schemas";
import type { UserPlannerInput } from "./types";

export type RecommendationResult = {
  planId: string;
  result: Awaited<ReturnType<typeof generateRecommendations>>["result"];
};

// 24h cache: identical answer patterns reuse the same personality teaser
// instead of paying for another OpenAI call.
const RECOMMENDATION_CACHE_TTL_SECONDS = 24 * 60 * 60;

type CachedAiResult = Awaited<ReturnType<typeof generateRecommendations>>;

/**
 * Create a personality teaser (FREE result) from the quiz answers.
 *
 * Flow:
 * 1. Map quiz input into UserPlannerInput
 * 2. Call AI to generate personality identity + top jurusan teaser
 * 3. Save plan + result to DB (status RECOMMENDED)
 *
 * The full self discovery report is generated only after payment succeeds.
 */
export async function createRecommendation(
  input: RecommendBusinessInput,
  meta?: { ipAddress?: string; userAgent?: string }
): Promise<RecommendationResult> {
  const userInput: UserPlannerInput = {
    capitalRange: input.capitalRange,
    locationCity: input.locationCity,
    ageRange: input.ageRange,
    areaType: input.areaType,
    categoryInterest: input.categoryInterest,
    sellingModel: input.sellingModel,
    availableTime: input.availableTime,
    targetIncome: input.targetIncome,
    riskPreference: input.riskPreference,
    marginPreference: input.marginPreference,
    assets: input.assets,
  };

  const cacheKey = makeCacheKey("ai-personality:v1", { userInput });
  const cached = await cacheGet<CachedAiResult>(cacheKey);

  let aiResult: CachedAiResult;
  if (cached) {
    logger.info(`[personality] cache hit (${cacheKey})`);
    aiResult = cached;
  } else {
    aiResult = await generateRecommendations({ userInput });
    cacheSet(cacheKey, aiResult, RECOMMENDATION_CACHE_TTL_SECONDS).catch(() => {});
  }

  const plan = await prisma.discoveryResult.create({
    data: {
      interestArea: input.categoryInterest,
      dailyEnergy: input.capitalRange,
      futureLifestyle: input.areaType,
      studentName: input.locationCity,
      age: input.ageRange,
      workStyle: input.sellingModel,
      naturalBehavior: input.availableTime,
      motivation: input.targetIncome,
      socialStyle: input.riskPreference,
      decisionStyle: input.marginPreference,
      identityTraits: input.assets,
      status: "RECOMMENDED",
      // Personality teaser (free result) lives in personalityJson.
      personalityJson: aiResult as unknown as object,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "CREATE_RECOMMENDATION",
      entityType: "DiscoveryResult",
      entityId: plan.id,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
      metadata: {
        source: "ai-generated",
        personalityTitle: aiResult.result.personalityTitle,
        cacheHit: Boolean(cached),
      },
    },
  });

  return {
    planId: plan.id,
    result: aiResult.result,
  };
}
