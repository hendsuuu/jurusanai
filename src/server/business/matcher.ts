import type { BusinessTemplate, UserPlannerInput } from "./types";

/**
 * Parse capital range string like:
 *   "Rp1-3 juta", "Rp3-5 juta", "Rp5-10 juta", ">Rp10 juta", "<Rp1 juta"
 * into a numeric range. The numbers in templates are in IDR.
 */
export function parseCapitalRange(input: string): {
  min: number;
  max: number;
  amount: number;
} {
  const cleaned = input
    .toLowerCase()
    .replace(/rp/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .trim();

  const millionMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*juta/);
  if (millionMatch) {
    const min = Number(millionMatch[1]) * 1_000_000;
    const max = Number(millionMatch[2]) * 1_000_000;
    return { min, max, amount: (min + max) / 2 };
  }

  const greaterMatch = cleaned.match(/^>\s*(\d+(?:\.\d+)?)\s*juta/);
  if (greaterMatch) {
    const min = Number(greaterMatch[1]) * 1_000_000;
    return { min, max: min * 2, amount: min };
  }

  const lessMatch = cleaned.match(/^<\s*(\d+(?:\.\d+)?)\s*juta/);
  if (lessMatch) {
    const max = Number(lessMatch[1]) * 1_000_000;
    return { min: 0, max, amount: max / 2 };
  }

  const singleMillion = cleaned.match(/(\d+(?:\.\d+)?)\s*juta/);
  if (singleMillion) {
    const v = Number(singleMillion[1]) * 1_000_000;
    return { min: v * 0.7, max: v * 1.3, amount: v };
  }

  // raw number assumed to be IDR
  const raw = Number(cleaned.replace(/\D/g, ""));
  if (Number.isFinite(raw) && raw > 0) {
    return { min: raw * 0.7, max: raw * 1.3, amount: raw };
  }

  return { min: 0, max: 0, amount: 0 };
}

function parseTargetIncome(input?: string) {
  if (!input) return 0;
  const cleaned = input.toLowerCase();
  const m = cleaned.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
  if (m) {
    return (Number(m[1]) + Number(m[2])) / 2 * 1_000_000;
  }
  const single = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (single) return Number(single[1]) * 1_000_000;
  return 0;
}

function normalize(s: string) {
  return s.toLowerCase().trim();
}

/**
 * Calculate a match score (0..100) for a template given user input.
 *
 * Scoring weights (sum 100):
 *   capital cocok          30
 *   area cocok             20
 *   minat cocok            15
 *   model jualan cocok     15
 *   asset/skill cocok      15
 *   target income realistis 5
 */
export function calculateBusinessMatch(
  userInput: UserPlannerInput,
  template: BusinessTemplate
): number {
  let score = 0;

  const capitalAmount =
    userInput.capitalAmount ?? parseCapitalRange(userInput.capitalRange).amount;

  // 1. Modal cocok (30%)
  if (capitalAmount >= template.minCapital) {
    if (capitalAmount <= template.maxCapital) {
      score += 30;
    } else {
      // overshoot is fine, partial points
      score += 22;
    }
  } else if (capitalAmount >= template.minCapital * 0.7) {
    score += 12;
  }

  // 2. Area (20%)
  const areaTypeNorm = normalize(userInput.areaType);
  if (
    template.suitableAreas.some(
      (a) => normalize(a) === areaTypeNorm || normalize(a).includes(areaTypeNorm)
    )
  ) {
    score += 20;
  }

  // 3. Minat (15%)
  if (normalize(template.category) === normalize(userInput.categoryInterest)) {
    score += 15;
  }

  // 4. Model jualan (15%)
  if (userInput.sellingModel) {
    const sellNorm = normalize(userInput.sellingModel);
    if (template.suitableModels.some((m) => normalize(m).includes(sellNorm))) {
      score += 15;
    }
  } else {
    score += 5;
  }

  // 5. Asset/skill (15%)
  const userAssetsNorm = userInput.assets.map(normalize);
  const assetMatches = template.suitableAssets.filter((a) =>
    userAssetsNorm.some((u) => normalize(a).includes(u) || u.includes(normalize(a)))
  ).length;
  score += Math.min(assetMatches * 5, 15);

  // 6. Target income realistis (5%)
  const targetIncome = parseTargetIncome(userInput.targetIncome);
  if (targetIncome > 0) {
    const templateMonthlyRevenue = template.products.reduce(
      (sum, p) => sum + p.sellingPrice * p.dailySales * 26,
      0
    );
    const templateMaxNet = templateMonthlyRevenue * 0.4;
    if (targetIncome <= templateMaxNet * 1.2) score += 5;
  } else {
    score += 2;
  }

  return Math.min(Math.round(score), 100);
}

export type MatchedTemplate = {
  template: BusinessTemplate;
  score: number;
};

export function matchTemplates(
  userInput: UserPlannerInput,
  templates: BusinessTemplate[]
): MatchedTemplate[] {
  return templates
    .map((template) => ({
      template,
      score: calculateBusinessMatch(userInput, template),
    }))
    .sort((a, b) => b.score - a.score);
}
