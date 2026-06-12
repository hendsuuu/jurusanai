export const APP_NAME = "JuruScope";

/**
 * Pricing for paid PDF reports.
 * `FREE` is not stored in the DB — it represents users who haven't paid yet
 * and can only see the free result (personality identity + top jurusan teaser).
 * The DB enum `PackageType` still includes `PRO` for backward-compat with
 * legacy orders and `BASIC` for old paid-report orders. New checkout only
 * sells `PREMIUM` as the Expert Deep Report.
 */
export const PACKAGE_PRICES = {
  PREMIUM: 99_000,
} as const;

export type PackageType = keyof typeof PACKAGE_PRICES;

export type PricingPlan = {
  type: PackageType;
  name: string;
  price: number;
  tagline: string;
  description: string;
  features: string[];
  cta: string;
  recommended?: boolean;
  badge?: string;
};

/** Paid plans shown inside the in-app pricing modal. */
export const PACKAGES: PricingPlan[] = [
  {
    type: "PREMIUM",
    name: "Expert Deep Report",
    price: PACKAGE_PRICES.PREMIUM,
    tagline: "Full report paling lengkap & personal",
    description:
      "Untuk kamu yang ingin memahami personality, jurusan, arah karir, lifestyle, dan roadmap pengembangan diri secara penuh.",
    features: [
      "PDF self discovery report lengkap",
      "Personality breakdown mendalam",
      "Top 5 jurusan + alasan kecocokan",
      "Future lifestyle compatibility",
      "Career direction & simulasi masa depan",
      "Skill roadmap bertahap",
      "Self development advice personal",
      "Strength & weakness mendalam",
    ],
    cta: "Pilih Expert",
    recommended: true,
    badge: "Recommended",
  },
];

/** Free tier description used on landing page (not a purchasable item). */
export const FREE_PLAN = {
  name: "Free",
  price: 0,
  tagline: "Kenali dirimu secara gratis",
  description:
    "Untuk kamu yang ingin tahu kepribadian dan jurusan yang paling cocok terlebih dahulu.",
  features: [
    "Jawab 50 pertanyaan ringan",
    "Personality identity kamu",
    "Top 3 jurusan paling cocok",
    "Ringkasan singkat & arah awal",
  ],
  cta: "Mulai Analisis",
} as const;

export const PLANNER_DRAFT_KEY = "juruscope.plannerDraft.v1";
