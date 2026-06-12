import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import { env } from "@/lib/env";
import { logger } from "@/server/utils/logger";
import { AppError } from "@/server/utils/error";

/**
 * GET /api/admin/storage?from=2025-01-01&to=2025-03-31&prefix=pdfs/
 *
 * List all files in R2/S3 storage. Only available in production (S3 driver).
 * Returns file name, size, lastModified, and key.
 */
export async function GET(req: NextRequest) {
  try {
    await requireSuperadmin();

    if (env.PDF_STORAGE_DRIVER !== "s3") {
      return fail("Storage browser hanya tersedia untuk S3/R2 driver", 400);
    }

    const { searchParams } = req.nextUrl;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const prefix = searchParams.get("prefix") || "pdfs/";

    const { S3Client, ListObjectsV2Command } = await import("@aws-sdk/client-s3");

    const client = new S3Client({
      region: env.S3_REGION || "auto",
      endpoint: env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });

    const files: Array<{
      key: string;
      name: string;
      size: number;
      lastModified: string;
      type: string;
    }> = [];

    let continuationToken: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const command = new ListObjectsV2Command({
        Bucket: env.S3_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      });

      const response = await client.send(command);
      const contents = response.Contents ?? [];

      for (const obj of contents) {
        if (!obj.Key || !obj.LastModified) continue;

        // Apply date filter
        const modified = obj.LastModified;
        if (from && modified < new Date(from)) continue;
        if (to && modified > new Date(to + "T23:59:59.999Z")) continue;

        const name = obj.Key.split("/").pop() || obj.Key;
        const ext = name.split(".").pop()?.toLowerCase() || "";
        const type = ext === "pdf" ? "application/pdf" : `file/${ext}`;

        files.push({
          key: obj.Key,
          name,
          size: obj.Size ?? 0,
          lastModified: modified.toISOString(),
          type,
        });
      }

      continuationToken = response.NextContinuationToken;
      hasMore = Boolean(response.IsTruncated && continuationToken);
    }

    // Sort by lastModified descending (newest first)
    files.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

    return ok({ files, total: files.length });
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.storage.list failed", error);
    return fail("Gagal memuat daftar file storage", 500);
  }
}

/**
 * DELETE /api/admin/storage
 * Body: { keys: string[] }
 *
 * Delete one or more files from R2/S3 storage.
 */
export async function DELETE(req: NextRequest) {
  try {
    await requireSuperadmin();

    if (env.PDF_STORAGE_DRIVER !== "s3") {
      return fail("Storage management hanya tersedia untuk S3/R2 driver", 400);
    }

    const body = await req.json().catch(() => ({}));
    const keys: string[] = body.keys;

    if (!Array.isArray(keys) || keys.length === 0) {
      return fail("Harus menyertakan array 'keys' yang tidak kosong", 400);
    }

    if (keys.length > 100) {
      return fail("Maksimal 100 file per request", 400);
    }

    const { S3Client, DeleteObjectsCommand } = await import("@aws-sdk/client-s3");

    const client = new S3Client({
      region: env.S3_REGION || "auto",
      endpoint: env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });

    const command = new DeleteObjectsCommand({
      Bucket: env.S3_BUCKET,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    });

    const response = await client.send(command);
    const errors = response.Errors ?? [];

    if (errors.length > 0) {
      logger.warn("[storage] Some files failed to delete", errors);
    }

    const deletedCount = keys.length - errors.length;

    logger.info(`[storage] Deleted ${deletedCount}/${keys.length} files from R2`);

    return ok(
      { deleted: deletedCount, errors: errors.length },
      `${deletedCount} file berhasil dihapus`
    );
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.storage.delete failed", error);
    return fail("Gagal menghapus file", 500);
  }
}
