import { z } from "zod";

/**
 * JuruScope AI schemas.
 *
 * Two AI outputs power the product:
 *   1. Personality Result (FREE teaser) — stored in `recommendationJson`.
 *      Shows personality identity, core trait scores, top jurusan teaser,
 *      and an emotional preview. Intentionally NOT the full content.
 *   2. Self Discovery Report (PAID, full) — stored in `aiPlanJson` and
 *      rendered into the premium PDF. Contains the 8 PRD report sections.
 *
 * The legacy type names (`AiRecommendations`, `AiRecommendationItem`,
 * `AiBusinessPlan`) are kept as aliases so the existing pipeline wiring
 * (payment, inngest, pdf service) keeps compiling while the data shape
 * is fully self-discovery.
 */

// ─── Core trait categories (PRD §17) ─────────────────────────────────────

export const CORE_TRAITS = [
  "creativity",
  "logic",
  "leadership",
  "communication",
  "exploration",
  "stability",
  "analytical_thinking",
  "social_intelligence",
] as const;

const coreTraitScoreSchema = z.object({
  /** Trait key or human label, e.g. "creativity" / "Kreativitas". */
  name: z.string(),
  /** 0-100 weighted score. */
  score: z.number().min(0).max(100),
});

const jurusanTeaserSchema = z.object({
  name: z.string(),
  /** 0-100 match percentage. */
  matchPercentage: z.number().min(0).max(100),
  /** One short sentence — teaser only. */
  reason: z.string(),
});

// ─── Personality Result (FREE teaser) ────────────────────────────────────

export const aiPersonalityResultSchema = z.object({
  /** Slug used as the "templateId" passed through the payment flow. */
  personalityId: z.string(),
  /** Personality identity, e.g. "Creative Strategist". */
  personalityTitle: z.string(),
  /** Short emotional one-liner. */
  tagline: z.string(),
  /** Short personality summary (free tier). */
  summary: z.string(),
  /** Emotional hook — "wah ini relate banget" feel. */
  emotionalPreview: z.string(),
  /** Basic future direction (free tier, 1-2 sentences). */
  basicFutureDirection: z.string(),
  /** Core trait scores (8 PRD categories). */
  coreTraits: z.array(coreTraitScoreSchema).default([]),
  /** Top jurusan teaser — top 3 only for the free result. */
  topJurusan: z.array(jurusanTeaserSchema).default([]),
});

export const aiPersonalityResponseSchema = z.object({
  result: aiPersonalityResultSchema,
});

export type AiPersonalityResult = z.infer<typeof aiPersonalityResultSchema>;
export type AiPersonalityResponse = z.infer<typeof aiPersonalityResponseSchema>;

// Legacy aliases (pipeline still imports these names).
export type AiRecommendationItem = AiPersonalityResult;
export type AiRecommendations = AiPersonalityResponse;
export const aiRecommendationsSchema = aiPersonalityResponseSchema;

// ─── Self Discovery Report (PAID, full PDF) ──────────────────────────────

const dominantTraitSchema = z.object({
  trait: z.string(),
  score: z.number().min(0).max(100),
  explanation: z.string(),
});

const strengthWeaknessItemSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const jurusanMatchSchema = z.object({
  jurusan: z.string(),
  match_percentage: z.number().min(0).max(100),
  reason: z.string(),
  career_example: z.string(),
});

const careerPathSchema = z.object({
  field: z.string(),
  /** e.g. "UI/UX → Product Designer → Creative Director". */
  progression: z.string(),
  explanation: z.string(),
});

const warningAreaSchema = z.object({
  area: z.string(),
  explanation: z.string(),
  suggestion: z.string(),
});

const developmentAdviceSchema = z.object({
  focus: z.string(),
  why: z.string(),
  action: z.string(),
});

const skillRoadmapPhaseSchema = z.object({
  phase: z.string(),
  focus: z.string(),
  skills: z.array(z.string()),
});

export const aiSelfDiscoveryReportSchema = z.object({
  cover: z.object({
    title: z.string(),
    personality_title: z.string(),
    tagline: z.string(),
    identity_label: z.string(),
    short_summary: z.string(),
  }),
  // Section 1
  personality_overview: z.object({
    overview: z.string(),
    core_identity: z.string(),
    dominant_traits: z.array(dominantTraitSchema),
    thinking_pattern: z.string(),
  }),
  // Section 2
  strength_weakness: z.object({
    strengths: z.array(strengthWeaknessItemSchema),
    weaknesses: z.array(strengthWeaknessItemSchema),
    balancing_note: z.string(),
  }),
  // Section 3
  top_jurusan_match: z.array(jurusanMatchSchema),
  // Section 4
  career_direction: z.object({
    summary: z.string(),
    paths: z.array(careerPathSchema),
  }),
  // Section 5
  future_lifestyle: z.object({
    work_style: z.string(),
    work_environment: z.string(),
    work_pressure: z.string(),
    lifestyle_compatibility: z.string(),
  }),
  // Section 6
  warning_area: z.object({
    warnings: z.array(warningAreaSchema),
  }),
  // Section 7
  self_development_advice: z.object({
    advices: z.array(developmentAdviceSchema),
  }),
  // Section 8
  skill_roadmap: z.object({
    phases: z.array(skillRoadmapPhaseSchema),
  }),
  closing: z.object({
    strategic_recommendation: z.string(),
    final_note: z.string(),
    disclaimer: z.string(),
  }),
});

export type AiSelfDiscoveryReport = z.infer<typeof aiSelfDiscoveryReportSchema>;

// Legacy alias (pdf service + plan service import this name).
export type AiBusinessPlan = AiSelfDiscoveryReport;
export const aiBusinessPlanSchema = aiSelfDiscoveryReportSchema;
