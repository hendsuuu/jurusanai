import { renderPdfBuffer } from "@/server/pdf/pdf.service";
import { buildSampleReport } from "@/server/pdf/sample-report";
import { logger } from "@/server/utils/logger";

/**
 * GET /api/sample-pdf
 *
 * Public endpoint that returns a sample PREMIUM self discovery report PDF
 * for the landing page "Lihat Contoh" button. Returns inline (not
 * attachment) so the browser PDF viewer opens.
 */
export async function GET() {
  try {
    const mockReport = buildSampleReport();

    const pdfBuffer = await renderPdfBuffer({
      ai: mockReport,
      packageType: "PREMIUM",
      personalityTitle: mockReport.cover.personality_title,
      locationCity: "Semarang",
      ageRange: "15-17 tahun",
      generatedAt: new Date(),
    });

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="contoh-self-discovery-juruscope.pdf"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    logger.error("sample-pdf generation failed", error);
    return new Response("Gagal generate sample PDF", { status: 500 });
  }
}
