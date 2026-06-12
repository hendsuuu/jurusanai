import { prisma } from "@/lib/prisma";

export type AppSettingsData = {
  pricePremium: number;
  promoPercentage: number;
  aiRecommendationProvider: string;
  aiRecommendationModel: string;
  aiPlanProvider: string;
  aiPlanModel: string;
  auditLogEnabled: boolean;
};

const SINGLETON_ID = "singleton";

const DEFAULT_SETTINGS: AppSettingsData = {
  pricePremium: 99000,
  promoPercentage: 0,
  aiRecommendationProvider: "openai",
  aiRecommendationModel: "gpt-5.4-mini",
  aiPlanProvider: "openai",
  aiPlanModel: "gpt-5.4-mini",
  auditLogEnabled: true,
};

/**
 * Get app settings. Creates default row if not exists.
 */
export async function getAppSettings(): Promise<AppSettingsData> {
  const settings = await prisma.appSettings.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...DEFAULT_SETTINGS },
    update: {},
  });
  return {
    pricePremium: settings.pricePremium,
    promoPercentage: settings.promoPercentage,
    aiRecommendationProvider: settings.aiRecommendationProvider,
    aiRecommendationModel: settings.aiRecommendationModel,
    aiPlanProvider: settings.aiPlanProvider,
    aiPlanModel: settings.aiPlanModel,
    auditLogEnabled: settings.auditLogEnabled,
  };
}

/**
 * Update app settings (partial update).
 */
export async function updateAppSettings(
  data: Partial<AppSettingsData>
): Promise<AppSettingsData> {
  const settings = await prisma.appSettings.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, ...DEFAULT_SETTINGS, ...data },
    update: data,
  });
  return {
    pricePremium: settings.pricePremium,
    promoPercentage: settings.promoPercentage,
    aiRecommendationProvider: settings.aiRecommendationProvider,
    aiRecommendationModel: settings.aiRecommendationModel,
    aiPlanProvider: settings.aiPlanProvider,
    aiPlanModel: settings.aiPlanModel,
    auditLogEnabled: settings.auditLogEnabled,
  };
}
