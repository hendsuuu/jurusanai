import type { NextRequest } from "next/server";
import { fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";
import { renderPdfBuffer } from "@/server/pdf/pdf.service";
import { buildSampleReport } from "@/server/pdf/sample-report";

/**
 * POST /api/admin/pdf-test
 *
 * Generate a test PDF using FULL MOCKUP data (no AI call).
 * Purpose: test PDF template layout only.
 * Body: { packageType: "PREMIUM" }
 */
export async function POST(req: NextRequest) {
  try {
    await requireSuperadmin();

    await req.json().catch(() => ({}));
    const packageType = "PREMIUM";

    const mockReport = buildSampleReport();

    const pdfBuffer = await renderPdfBuffer({
      ai: mockReport,
      packageType,
      personalityTitle: mockReport.cover.personality_title,
      locationCity: "Semarang",
      ageRange: "15-17 tahun",
      generatedAt: new Date(),
    });

    const fileName = `test-${packageType.toLowerCase()}-self-discovery.pdf`;
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.pdf-test failed", error);
    return fail("Gagal generate test PDF", 500);
  }
}
