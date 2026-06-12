import path from "node:path";
import { promises as fs } from "node:fs";
import { env } from "@/lib/env";
import { logger } from "@/server/utils/logger";

export type StoredFile = {
  url: string;
  driver: "local" | "supabase" | "s3";
  key: string;
};

/**
 * Store a PDF file. Supports:
 * - "local": writes to /public/generated-pdfs (dev only, not for Vercel)
 * - "s3": uploads to S3-compatible storage (Cloudflare R2, AWS S3, MinIO)
 * - "supabase": uploads to Supabase Storage via its S3-compatible API
 */
export async function storePdf(
  fileName: string,
  buffer: Buffer | string
): Promise<StoredFile> {
  const driver = env.PDF_STORAGE_DRIVER;
  const data =
    typeof buffer === "string" ? Buffer.from(buffer, "utf-8") : buffer;

  if (driver === "s3") {
    return storeToS3(fileName, data);
  }

  if (driver === "supabase") {
    return storeToSupabase(fileName, data);
  }

  if (driver === "local") {
    return storeLocal(fileName, data);
  }

  logger.warn(`PDF_STORAGE_DRIVER=${driver} not supported, using local.`);
  return storeLocal(fileName, data);
}

// ─── Local driver ────────────────────────────────────────────────────────

async function storeLocal(fileName: string, data: Buffer): Promise<StoredFile> {
  const dir = path.join(process.cwd(), "public", "generated-pdfs");
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, fileName);
  await fs.writeFile(filePath, data);
  return {
    url: `/generated-pdfs/${fileName}`,
    driver: "local",
    key: fileName,
  };
}

// ─── S3/R2 driver ────────────────────────────────────────────────────────

async function storeToS3(fileName: string, data: Buffer): Promise<StoredFile> {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

  // Cloudflare R2 requires:
  //   - region: "auto" (not a real AWS region)
  //   - endpoint: the R2 API endpoint (https://<account-id>.r2.cloudflarestorage.com)
  //   - forcePathStyle: true
  // AWS S3 uses standard region codes like "us-east-1", "ap-southeast-1"
  const region = env.S3_REGION || "auto";

  const client = new S3Client({
    region,
    endpoint: env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  const key = `pdfs/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    Body: data,
    ContentType: "application/pdf",
    ContentDisposition: `attachment; filename="${fileName}"`,
  });

  try {
    await client.send(command);
    logger.info(`[storage] PDF uploaded to S3/R2: ${key} (${data.length} bytes)`);
  } catch (err) {
    logger.error("[storage] S3/R2 upload failed", err);
    throw err;
  }

  return {
    url: `s3://${env.S3_BUCKET}/${key}`,
    driver: "s3",
    key,
  };
}

// ─── Supabase Storage driver ─────────────────────────────────────────────
// Uses Supabase's S3-compatible API endpoint so no extra SDK is needed.

async function storeToSupabase(
  fileName: string,
  data: Buffer
): Promise<StoredFile> {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");

  if (!env.SUPABASE_STORAGE_URL) {
    throw new Error("SUPABASE_STORAGE_URL is required for Supabase storage driver");
  }
  if (!env.SUPABASE_STORAGE_KEY) {
    throw new Error("SUPABASE_STORAGE_KEY is required for Supabase storage driver");
  }
  if (!env.SUPABASE_STORAGE_SECRET) {
    throw new Error("SUPABASE_STORAGE_SECRET is required for Supabase storage driver");
  }

  const bucket = env.SUPABASE_STORAGE_BUCKET || env.S3_BUCKET;
  if (!bucket) {
    throw new Error("SUPABASE_STORAGE_BUCKET (or S3_BUCKET) is required for Supabase storage driver");
  }

  const client = new S3Client({
    region: env.SUPABASE_STORAGE_REGION || "ap-southeast-1",
    endpoint: env.SUPABASE_STORAGE_URL,
    credentials: {
      accessKeyId: env.SUPABASE_STORAGE_KEY,
      secretAccessKey: env.SUPABASE_STORAGE_SECRET,
    },
    forcePathStyle: true,
  });

  const key = `pdfs/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: data,
    ContentType: "application/pdf",
    ContentDisposition: `attachment; filename="${fileName}"`,
  });

  try {
    await client.send(command);
    logger.info(
      `[storage] PDF uploaded to Supabase Storage: ${bucket}/${key} (${data.length} bytes)`
    );
  } catch (err) {
    logger.error("[storage] Supabase Storage upload failed", err);
    throw err;
  }

  return {
    url: `supabase://${bucket}/${key}`,
    driver: "supabase",
    key,
  };
}

// ─── Supabase fetch helper (used by download route) ──────────────────────

export async function fetchFromSupabase(supabaseUrl: string): Promise<Buffer> {
  const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");

  // Parse supabase://bucket/key
  const withoutProtocol = supabaseUrl.replace("supabase://", "");
  const slashIndex = withoutProtocol.indexOf("/");
  const bucket = withoutProtocol.slice(0, slashIndex);
  const key = withoutProtocol.slice(slashIndex + 1);

  const client = new S3Client({
    region: env.SUPABASE_STORAGE_REGION || "ap-southeast-1",
    endpoint: env.SUPABASE_STORAGE_URL,
    credentials: {
      accessKeyId: env.SUPABASE_STORAGE_KEY,
      secretAccessKey: env.SUPABASE_STORAGE_SECRET,
    },
    forcePathStyle: true,
  });

  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await client.send(command);

  if (!response.Body) {
    throw new Error(`Supabase Storage returned empty body for ${supabaseUrl}`);
  }

  const chunks: Uint8Array[] = [];
  const stream = response.Body as AsyncIterable<Uint8Array>;
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
