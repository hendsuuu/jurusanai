import { Redis } from "@upstash/redis";
import { createHash } from "node:crypto";
import { env } from "@/lib/env";
import { logger } from "@/server/utils/logger";

/**
 * Lightweight Upstash Redis cache helper.
 *
 * - Reuses the same Upstash credentials as the rate limiter.
 * - Falls back to a no-op when Upstash is not configured (dev without Redis),
 *   so callers can always treat caching as best-effort.
 * - All values are JSON-serialized; consumers stay typed via generics.
 *
 * Use this for cross-request caching of expensive AI/work results where
 * a small amount of staleness is acceptable. Do NOT cache anything tied
 * to a specific user account or that needs strong consistency.
 */

const isConfigured = Boolean(
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
);

const redis = isConfigured
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const raw = await redis.get<T>(key);
    return raw ?? null;
  } catch (err) {
    logger.warn("[cache] get failed", { key, err });
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    logger.warn("[cache] set failed", { key, err });
  }
}

/**
 * Build a stable cache key from arbitrary input by hashing a JSON
 * representation. The input shape is sorted so `{a:1,b:2}` and
 * `{b:2,a:1}` produce the same key.
 */
export function makeCacheKey(prefix: string, input: unknown): string {
  const stable = JSON.stringify(input, Object.keys(input as object).sort());
  const hash = createHash("sha256").update(stable).digest("hex").slice(0, 24);
  return `${prefix}:${hash}`;
}
