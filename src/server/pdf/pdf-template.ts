/**
 * LEGACY FILE — kept for backward compatibility of type exports.
 *
 * PDF rendering is now handled by react-pdf-template.tsx via @react-pdf/renderer.
 * This file only exports types that may be referenced elsewhere.
 */

import type { DiscoveryResult, Order } from "@prisma/client";
import type { AiBusinessPlan } from "@/server/ai/schemas";

export type PdfRenderArgs = {
  plan: DiscoveryResult;
  order?: Order | null;
  ai: AiBusinessPlan;
};

export type PdfDocumentParts = {
  html: string;
  headerTemplate: string;
  footerTemplate: string;
};

/**
 * @deprecated Use renderPdfBuffer from pdf.service.ts instead.
 * Kept as no-op for any legacy call sites.
 */
export function renderPlanDocument(_args: PdfRenderArgs): PdfDocumentParts {
  return {
    html: "<html><body><p>Use @react-pdf/renderer via pdf.service.ts</p></body></html>",
    headerTemplate: "",
    footerTemplate: "",
  };
}

/**
 * @deprecated Use renderPdfBuffer from pdf.service.ts instead.
 */
export function renderPlanHtml(args: PdfRenderArgs): string {
  return renderPlanDocument(args).html;
}
