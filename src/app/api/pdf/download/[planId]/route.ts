import { type NextRequest } from "next/server";
import { fail } from "@/server/utils/api-response";
import { prisma } from "@/lib/prisma";
import { logger } from "@/server/utils/logger";
import { generatePdfForPlan } from "@/server/pdf/pdf.service";
import { fetchFromSupabase } from "@/server/pdf/storage.service";
import { env } from "@/lib/env";
import path from "node:path";
import { promises as fs } from "node:fs";

/**
 * GET /api/pdf/download/[planId]
 *
 * Serves the generated PDF file as a download.
 * Supports: local files, s3:// URLs (fetched from R2/S3), and https:// URLs (redirect).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;
    const plan = await prisma.discoveryResult.findUnique({
      where: { id: planId },
      include: {
        orders: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
    if (!plan) return fail("Plan tidak ditemukan", 404);

    const paid = plan.orders.some((o) => o.status === "SUCCESS");
    if (!paid) return fail("Plan belum dibayar", 403);
    if (plan.status !== "PDF_READY" && plan.status !== "PAID") {
      return fail("PDF belum siap", 404);
    }

    // If pdfUrl is missing or legacy .html, regenerate
    let pdfUrl = plan.pdfUrl;
    if (!pdfUrl || pdfUrl.endsWith(".html")) {
      logger.info(`[pdf.download] Regenerating PDF for plan ${planId}`);
      try {
        if (plan.status === "PDF_READY") {
          await prisma.discoveryResult.update({
            where: { id: planId },
            data: { status: "PAID" },
          });
        }
        const result = await generatePdfForPlan(planId);
        pdfUrl = result.url;
        await prisma.discoveryResult.update({
          where: { id: planId },
          data: { pdfUrl: result.url, status: "PDF_READY" },
        });
      } catch (genErr) {
        logger.error("Auto-regenerate PDF failed", genErr);
        return fail("Gagal generate PDF. Coba lagi.", 500);
      }
    }

    const safeName = (plan.personalityTitle ?? "Self-Discovery")
      .replace(/[^a-zA-Z0-9\-_ ]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60);
    const downloadName = `JuruScope-${safeName}.pdf`;

    await prisma.auditLog.create({
      data: {
        action: "DOWNLOAD_PDF",
        entityType: "BusinessPlan",
        entityId: plan.id,
      },
    });

    // Handle s3:// URLs — fetch from S3/R2 and stream to user
    if (pdfUrl.startsWith("s3://")) {
      const fileBuffer = await fetchFromS3(pdfUrl);
      return new Response(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${downloadName}"`,
          "Content-Length": String(fileBuffer.length),
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    // Handle supabase:// URLs — fetch from Supabase Storage and stream to user
    if (pdfUrl.startsWith("supabase://")) {
      const fileBuffer = await fetchFromSupabase(pdfUrl);
      return new Response(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${downloadName}"`,
          "Content-Length": String(fileBuffer.length),
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    // Handle absolute https:// URLs — redirect
    if (pdfUrl.startsWith("http://") || pdfUrl.startsWith("https://")) {
      return Response.redirect(pdfUrl, 302);
    }

    // Local file: read from disk
    const filePath = path.join(process.cwd(), "public", pdfUrl);
    try {
      const fileBuffer = await fs.readFile(filePath);
      return new Response(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${downloadName}"`,
          "Content-Length": String(fileBuffer.length),
          "Cache-Control": "private, max-age=3600",
        },
      });
    } catch (fileErr) {
      logger.error("PDF file not found on disk", { filePath, error: fileErr });
      return fail("File PDF tidak ditemukan di server", 404);
    }
  } catch (error) {
    logger.error("pdf.download failed", error);
    return fail("Gagal mengunduh PDF", 500);
  }
}

/**
 * Fetch a PDF from S3/R2 using the s3://bucket/key URL format.
 */
async function fetchFromS3(s3Url: string): Promise<Buffer> {
  const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");

  // Parse s3://bucket/key
  const withoutProtocol = s3Url.replace("s3://", "");
  const slashIndex = withoutProtocol.indexOf("/");
  const bucket = withoutProtocol.slice(0, slashIndex);
  const key = withoutProtocol.slice(slashIndex + 1);

  const client = new S3Client({
    region: env.S3_REGION || "auto",
    endpoint: env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await client.send(command);

  if (!response.Body) {
    throw new Error(`S3 returned empty body for ${s3Url}`);
  }

  // Convert readable stream to Buffer
  const chunks: Uint8Array[] = [];
  const stream = response.Body as AsyncIterable<Uint8Array>;
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
