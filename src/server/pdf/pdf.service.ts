import React from "react";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";
import { storePdf } from "./storage.service";
import type { AiSelfDiscoveryReport } from "@/server/ai/schemas";

/**
 * Generate a Self Discovery Report PDF using @react-pdf/renderer.
 *
 * Serverless-friendly (no Puppeteer/Chromium needed).
 */
export async function generatePdfForPlan(planId: string) {
  const plan = await prisma.discoveryResult.findUnique({
    where: { id: planId },
    include: {
      orders: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!plan) throw new AppError("PLAN_NOT_FOUND", "Hasil tidak ditemukan", 404);
  if (!plan.reportJson) {
    throw new AppError(
      "PLAN_DATA_INCOMPLETE",
      "Data hasil belum lengkap untuk generate PDF",
      400
    );
  }
  if (plan.status !== "PAID" && plan.status !== "PDF_READY") {
    throw new AppError(
      "PAYMENT_NOT_PAID",
      "Hasil belum dibayar — PDF tidak boleh digenerate",
      400
    );
  }

  const ai = plan.reportJson as unknown as AiSelfDiscoveryReport;
  const order = plan.orders[0] ?? null;
  const packageType = (order?.packageType ?? "PREMIUM") as "BASIC" | "PREMIUM" | "PRO";

  const pdfBuffer = await renderPdfBuffer({
    ai,
    packageType,
    personalityTitle: plan.personalityTitle ?? ai.cover.personality_title ?? "Self Discovery Report",
    locationCity: plan.studentName ?? "",
    ageRange: plan.age ?? "",
    generatedAt: plan.createdAt ?? new Date(),
  });

  const fileName = `${plan.id}.pdf`;
  const stored = await storePdf(fileName, pdfBuffer);

  await prisma.auditLog.create({
    data: {
      action: "GENERATE_PDF",
      entityType: "DiscoveryResult",
      entityId: plan.id,
    },
  });

  return { url: stored.url, key: stored.key };
}

/**
 * Render PDF to Buffer using @react-pdf/renderer.
 * Exported so admin test route can also use it directly.
 */
export async function renderPdfBuffer(data: {
  ai: AiSelfDiscoveryReport;
  packageType: "BASIC" | "PREMIUM" | "PRO";
  personalityTitle: string;
  locationCity: string;
  ageRange?: string;
  generatedAt: Date;
}): Promise<Buffer> {
  const { renderToBuffer } = await import("@react-pdf/renderer");
  const { PremiumPdfDocument, BasicPdfDocument } = await import("./react-pdf-template");

  const pdfData = {
    ai: data.ai,
    packageType: data.packageType,
    personalityTitle: data.personalityTitle,
    locationCity: data.locationCity,
    ageRange: data.ageRange ?? "",
    generatedAt: data.generatedAt,
  };

  let element: React.ReactElement;
  if (data.packageType === "BASIC") {
    element = React.createElement(BasicPdfDocument, { data: pdfData });
  } else {
    element = React.createElement(PremiumPdfDocument, { data: pdfData });
  }

  logger.info(`[pdf] Rendering ${data.packageType} report for ${data.personalityTitle}...`);

  const buffer = await renderToBuffer(element as never);
  const nodeBuffer = Buffer.from(buffer);

  logger.info(`[pdf] PDF rendered: ${nodeBuffer.length} bytes`);
  return nodeBuffer;
}
