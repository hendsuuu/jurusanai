import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import { env } from "@/lib/env";
import { logger } from "@/server/utils/logger";
import { AppError } from "@/server/utils/error";
import { storePdf, fetchFromSupabase } from "@/server/pdf/storage.service";

/**
 * POST /api/admin/storage-test
 *
 * Tests the configured storage driver by uploading a small dummy file,
 * reading it back, then deleting it. Validates credentials end-to-end.
 *
 * Returns: { driver, bucket, uploadOk, downloadOk, deleteOk, durationMs }
 */
export async function POST(_req: NextRequest) {
  try {
    await requireSuperadmin();

    const driver = env.PDF_STORAGE_DRIVER;
    if (driver === "local") {
      return fail(
        "Storage test tidak tersedia untuk driver 'local'. Ganti PDF_STORAGE_DRIVER ke 'supabase' atau 's3'.",
        400
      );
    }

    const start = Date.now();
    const testFileName = `_storage-test-${Date.now()}.pdf`;
    const testContent = Buffer.from("%PDF-1.4 test-file-can-be-deleted");

    // 1. Upload
    let stored;
    try {
      stored = await storePdf(testFileName, testContent);
    } catch (err) {
      logger.error("[storage-test] Upload failed", err);
      return fail(`Upload gagal: ${(err as Error).message}`, 500);
    }

    // 2. Download / read back
    let downloadOk = false;
    let downloadError: string | null = null;
    try {
      let buf: Buffer;
      if (stored.url.startsWith("supabase://")) {
        buf = await fetchFromSupabase(stored.url);
      } else {
        buf = await fetchFromS3(stored.url);
      }
      downloadOk = buf.length > 0;
    } catch (err) {
      downloadError = (err as Error).message;
      logger.warn("[storage-test] Download failed", err);
    }

    // 3. Delete test file
    let deleteOk = false;
    let deleteError: string | null = null;
    try {
      await deleteFromStorage(stored.url, stored.key);
      deleteOk = true;
    } catch (err) {
      deleteError = (err as Error).message;
      logger.warn("[storage-test] Delete failed", err);
    }

    const durationMs = Date.now() - start;
    const bucket =
      driver === "supabase"
        ? env.SUPABASE_STORAGE_BUCKET || env.S3_BUCKET
        : env.S3_BUCKET;

    return ok({
      driver,
      bucket,
      storedUrl: stored.url,
      uploadOk: true,
      downloadOk,
      deleteOk,
      durationMs,
      ...(downloadError ? { downloadError } : {}),
      ...(deleteError ? { deleteError } : {}),
    });
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.storage-test failed", error);
    return fail("Storage test gagal", 500);
  }
}

async function fetchFromS3(s3Url: string): Promise<Buffer> {
  const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");

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

  const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  if (!response.Body) throw new Error("Empty response body from S3");

  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function deleteFromStorage(storedUrl: string, key: string): Promise<void> {
  const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3");

  const isSupabase = storedUrl.startsWith("supabase://");
  const withoutProtocol = storedUrl.replace(/^(supabase|s3):\/\//, "");
  const slashIndex = withoutProtocol.indexOf("/");
  const bucket = withoutProtocol.slice(0, slashIndex);

  const client = isSupabase
    ? new S3Client({
        region: env.SUPABASE_STORAGE_REGION || "ap-southeast-1",
        endpoint: env.SUPABASE_STORAGE_URL,
        credentials: {
          accessKeyId: env.SUPABASE_STORAGE_KEY,
          secretAccessKey: env.SUPABASE_STORAGE_SECRET,
        },
        forcePathStyle: true,
      })
    : new S3Client({
        region: env.S3_REGION || "auto",
        endpoint: env.S3_ENDPOINT || undefined,
        credentials: {
          accessKeyId: env.S3_ACCESS_KEY_ID,
          secretAccessKey: env.S3_SECRET_ACCESS_KEY,
        },
        forcePathStyle: true,
      });

  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
