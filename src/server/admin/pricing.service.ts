import { prisma } from "@/lib/prisma";
import { PACKAGE_PRICES } from "@/lib/constants";
import { logger } from "@/server/utils/logger";

export type PricingConfig = {
  premium: number;
  promoPercentage: number;
};

/**
 * Get current pricing from database settings. Falls back to hardcoded
 * constants if DB is unavailable or settings row doesn't exist yet.
 */
export async function getCurrentPricing(): Promise<PricingConfig> {
  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: "singleton" },
      select: { pricePremium: true, promoPercentage: true },
    });

    if (settings) {
      return {
        premium: settings.pricePremium,
        promoPercentage: settings.promoPercentage,
      };
    }
  } catch (err) {
    logger.warn("[pricing] Failed to read settings from DB, using defaults", err);
  }

  return {
    premium: PACKAGE_PRICES.PREMIUM,
    promoPercentage: 0,
  };
}

/**
 * Calculate the final price for a package type, applying promo if active.
 */
export function applyPromo(basePrice: number, promoPercentage: number): number {
  if (promoPercentage <= 0 || promoPercentage > 100) return basePrice;
  return Math.round(basePrice * (1 - promoPercentage / 100));
}
