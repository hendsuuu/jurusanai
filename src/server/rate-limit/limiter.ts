import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";
import { AppError } from "@/server/utils/error";

/**
 * Rate limit utilities. When Upstash credentials are not set (development)
 * the limiter falls back to a no-op so devs can run locally without Redis.
 */

type LimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type Limiter = {
  limit(key: string): Promise<LimitResult>;
};

const upstashConfigured = Boolean(
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
);

const redis = upstashConfigured
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

function makeLimiter(tokens: number, window: `${number} ${"s" | "m" | "h"}`) {
  if (redis) {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(tokens, window),
      analytics: true,
    });
  }
  // Dev fallback: always allow.
  const fallback: Limiter = {
    async limit() {
      return {
        success: true,
        limit: tokens,
        remaining: tokens,
        reset: Date.now() + 60_000,
      };
    },
  };
  return fallback;
}

export const aiGenerateLimiter = makeLimiter(2, "30 m");
export const selectIdeaLimiter = makeLimiter(10, "30 m");
export const paymentLimiter = makeLimiter(10, "10 m");
export const webhookLimiter = makeLimiter(60, "10 m");
export const authLimiter = makeLimiter(10, "10 m");

export async function rateLimitOrThrow(
  limiter: Limiter | Ratelimit,
  key: string
) {
  const result = await limiter.limit(key);
  if (!result.success) {
    throw new AppError("RATE_LIMITED", "Too many requests", 429);
  }
  return result;
}
