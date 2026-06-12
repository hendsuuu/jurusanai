import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import { env } from "@/lib/env";
import { logger } from "@/server/utils/logger";
import { AppError } from "@/server/utils/error";

type StorageDriver = "s3" | "supabase";

function isStorageBrowser(): boolean {
  return env.PDF_STORAGE_DRIVER === "s3" || env.PDF_STORAGE_DRIVER === "supabase";
}

function buildS3Client() {
  const { S3Client } = require("@aws-sdk/client-s3");
  const driver = env.PDF_STORAGE_DRIVER as StorageDriver;

  if (driver === "supabase") {
    return new S3Client({
      region: env.SUPABASE_STORAGE_REGION || "ap-southeast-1",
      endpoint: env.SUPABASE_STORAGE_URL,
      credentials: {
        accessKeyId: env.SUPABASE_STORAGE_KEY,
        secretAccessKey: env.SUPABASE_STORAGE_SECRET,
      },
      forcePathStyle: true,
    });
  }

  return new S3Client({
    region: env.S3_REGION || "auto",
    endpoint: env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });
}

function activeBucket(): string {
  return env.PDF_STORAGE_DRIVER === "supabase"
    ? env.SUPABASE_STORAGE_BUCKET || env.S3_BUCKET
    : env.S3_BUCKET;
}

/**
 * GET /api/admin/storage?from=2025-01-01&to=2025-03-31&prefix=pdfs/
 *
 * List all files in cloud storage. Available for S3/R2 and Supabase drivers.
 * Returns file name, size, lastModified, and key.
 */
export async function GET(req: NextRequest) {
  try {
    await requireSuperadmin();

    if (!isStorageBrowser()) {
      return fail("Storage browser hanya tersedia untuk S3/R2 atau Supabase driver", 400);
    }

    const { searchParams } = req.nextUrl;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const prefix = searchParams.get("prefix") || "pdfs/";

    const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
    const client = buildS3Client();

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
        Bucket: activeBucket(),
        Prefix: prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      });

      const response = await client.send(command);
      const contents = response.Contents ?? [];

      for (const obj of contents) {
        if (!obj.Key || !obj.LastModified) continue;

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
 * Delete one or more files from cloud storage.
 */
export async function DELETE(req: NextRequest) {
  try {
    await requireSuperadmin();

    if (!isStorageBrowser()) {
      return fail("Storage management hanya tersedia untuk S3/R2 atau Supabase driver", 400);
    }

    const body = await req.json().catch(() => ({}));
    const keys: string[] = body.keys;

    if (!Array.isArray(keys) || keys.length === 0) {
      return fail("Harus menyertakan array 'keys' yang tidak kosong", 400);
    }

    if (keys.length > 100) {
      return fail("Maksimal 100 file per request", 400);
    }

    const { DeleteObjectsCommand } = await import("@aws-sdk/client-s3");
    const client = buildS3Client();

    const command = new DeleteObjectsCommand({
      Bucket: activeBucket(),
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
    logger.info(`[storage] Deleted ${deletedCount}/${keys.length} files`);

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
