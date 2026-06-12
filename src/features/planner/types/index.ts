// ─── Personality result (FREE teaser) ──────────────────────────────────────

export type CoreTraitScore = {
  name: string;
  score: number;
};

export type JurusanTeaser = {
  name: string;
  matchPercentage: number;
  reason: string;
};

export type PersonalityResult = {
  personalityId: string;
  personalityTitle: string;
  tagline: string;
  summary: string;
  emotionalPreview: string;
  basicFutureDirection: string;
  coreTraits: CoreTraitScore[];
  topJurusan: JurusanTeaser[];
};

// ─── Wizard / quiz input ────────────────────────────────────────────────────

export type CreateRecommendationRequest = {
  capitalRange: string;
  locationCity: string;
  ageRange: string;
  areaType: string;
  categoryInterest: string;
  sellingModel?: string;
  availableTime?: string;
  targetIncome?: string;
  riskPreference?: string;
  marginPreference?: string;
  assets: string[];
};

export type CreateRecommendationResponse = {
  planId: string;
  result: PersonalityResult;
};

export type SelectBusinessIdeaRequest = {
  planId: string;
  templateId: string;
};

// ─── Self Discovery Report (full, paid) ─────────────────────────────────────

export type SelfDiscoveryReport = {
  cover: {
    title: string;
    personality_title: string;
    tagline: string;
    identity_label: string;
    short_summary: string;
  };
  personality_overview: {
    overview: string;
    core_identity: string;
    dominant_traits: Array<{ trait: string; score: number; explanation: string }>;
    thinking_pattern: string;
  };
  top_jurusan_match: Array<{
    jurusan: string;
    match_percentage: number;
    reason: string;
    career_example: string;
  }>;
  career_direction: {
    summary: string;
    paths: Array<{ field: string; progression: string; explanation: string }>;
  };
  closing: {
    strategic_recommendation: string;
    final_note: string;
    disclaimer: string;
  };
  // Other sections exist but the frontend preview only reads the above.
  [key: string]: unknown;
};

export type SelectBusinessIdeaResponse = {
  planId: string;
  selectedIdeaName: string;
  aiPlan: SelfDiscoveryReport;
};

export type PlanPreviewResponse = {
  planId: string;
  selectedIdeaName: string | null;
  selectedTemplateId: string | null;
  locationCity: string;
  ageRange: string;
  areaType: string;
  categoryInterest: string;
  capitalRange: string;
  status: string;
  aiPlan: SelfDiscoveryReport | null;
  result: PersonalityResult | null;
  hasSuccessfulOrder: boolean;
  pdfReady: boolean;
  pdfUrl: string | null;
};
