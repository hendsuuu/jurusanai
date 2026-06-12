import { prisma } from "@/lib/prisma";
import { generateBusinessPlan } from "@/server/ai/client";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";
import type { UserPlannerInput } from "./types";
import type { AiPersonalityResult, AiSelfDiscoveryReport } from "@/server/ai/schemas";

export type SelectedPlanResult = {
  planId: string;
  selectedIdeaName: string;
  aiPlan: AiSelfDiscoveryReport;
};

/**
 * Generate the full Self Discovery Report from the stored personality teaser.
 *
 * `templateId` is the `personalityId` slug that was passed through the
 * payment flow. We resolve the stored personality result and expand it
 * into the full 8-section report (paid PDF content).
 */
export async function selectBusinessIdea(args: {
  planId: string;
  templateId: string;
  meta?: { ipAddress?: string; userAgent?: string };
}): Promise<SelectedPlanResult> {
  const plan = await prisma.discoveryResult.findUnique({
    where: { id: args.planId },
  });
  if (!plan) throw new AppError("PLAN_NOT_FOUND", "Hasil tidak ditemukan", 404);

  const userInput: UserPlannerInput = {
    capitalRange: plan.dailyEnergy,
    locationCity: plan.studentName ?? "",
    ageRange: plan.age ?? undefined,
    areaType: plan.futureLifestyle,
    categoryInterest: plan.interestArea,
    sellingModel: plan.workStyle ?? undefined,
    availableTime: plan.naturalBehavior ?? undefined,
    targetIncome: plan.motivation ?? undefined,
    riskPreference: plan.socialStyle ?? undefined,
    marginPreference: plan.decisionStyle ?? undefined,
    assets: plan.identityTraits ?? [],
  };

  const personality = resolvePersonality(plan.personalityJson);
  if (!personality) {
    throw new AppError(
      "NOT_FOUND",
      "Hasil kepribadian tidak ditemukan. Coba ulangi quiz.",
      404
    );
  }

  const selectedName = personality.personalityTitle;

  logger.info(
    `[plan.service] Generating self discovery report for: ${selectedName} (${args.templateId})`
  );

  const aiPlan = await generateBusinessPlan({ personality, userInput });

  await prisma.discoveryResult.update({
    where: { id: plan.id },
    data: {
      personalityId: personality.personalityId,
      personalityTitle: selectedName,
      metaJson: {
        personalityId: personality.personalityId,
        source: "ai-generated",
        generatedAt: new Date().toISOString(),
      },
      reportJson: aiPlan as unknown as object,
      status: "GENERATED",
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "SELECT_PERSONALITY",
      entityType: "DiscoveryResult",
      entityId: plan.id,
      ipAddress: args.meta?.ipAddress,
      userAgent: args.meta?.userAgent,
      metadata: {
        templateId: args.templateId,
        selectedIdeaName: selectedName,
        source: "ai-generated",
      },
    },
  });

  return {
    planId: plan.id,
    selectedIdeaName: selectedName,
    aiPlan,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────

/** Extract the stored personality teaser from personalityJson. */
function resolvePersonality(
  personalityJson: unknown
): AiPersonalityResult | null {
  if (!personalityJson || typeof personalityJson !== "object") return null;
  const data = personalityJson as { result?: AiPersonalityResult };
  return data.result ?? null;
}

// ─── Plan Preview ────────────────────────────────────────────────────────

export async function getPlanPreview(planId: string) {
  const plan = await prisma.discoveryResult.findUnique({
    where: { id: planId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!plan) throw new AppError("PLAN_NOT_FOUND", "Hasil tidak ditemukan", 404);

  const aiPlan = plan.reportJson as unknown as AiSelfDiscoveryReport | null;
  const recommendation = plan.personalityJson as unknown as {
    result?: AiPersonalityResult;
  } | null;

  const hasSuccessfulOrder = plan.orders.some((o) => o.status === "SUCCESS");
  const pdfReady = plan.status === "PDF_READY" && Boolean(plan.pdfUrl);

  return {
    planId: plan.id,
    selectedIdeaName: plan.personalityTitle,
    selectedTemplateId: plan.personalityId,
    locationCity: plan.studentName ?? "",
    ageRange: plan.age ?? "",
    areaType: plan.futureLifestyle,
    categoryInterest: plan.interestArea,
    capitalRange: plan.dailyEnergy,
    status: plan.status,
    aiPlan,
    result: recommendation?.result ?? null,
    hasSuccessfulOrder,
    pdfReady,
    pdfUrl: pdfReady ? `/api/pdf/download/${plan.id}` : null,
  };
}
