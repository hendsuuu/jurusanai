import type { NextRequest } from "next/server";
import { headers } from "next/headers";

/**
 * Extract client IP from request headers.
 *
 * Security: We only trust platform-injected headers that cannot be spoofed
 * by end users. The priority order:
 *
 * 1. Vercel's `x-vercel-forwarded-for` — injected by Vercel's edge, cannot
 *    be spoofed by the client.
 * 2. Cloudflare's `cf-connecting-ip` — injected by CF, cannot be spoofed.
 * 3. `x-real-ip` — typically set by trusted reverse proxies (nginx, etc).
 * 4. `x-forwarded-for` — ONLY the LAST entry (rightmost) is trusted when
 *    behind a single proxy layer. The first entry can be spoofed by clients.
 *    However, on Vercel/Cloudflare the platform strips/overwrites this header,
 *    so we take the first entry only as a last resort.
 *
 * Falls back to "unknown" if no header is available (e.g. local dev).
 */
export function getClientIp(req: NextRequest | Request): string {
  const h = req.headers;

  // Platform-injected headers (cannot be spoofed by end users)
  const vercelForwarded = h.get("x-vercel-forwarded-for");
  if (vercelForwarded) {
    return vercelForwarded.split(",")[0]?.trim() || "unknown";
  }

  const cfConnecting = h.get("cf-connecting-ip");
  if (cfConnecting) {
    return cfConnecting.trim();
  }

  // Trusted proxy header
  const realIp = h.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Fallback: x-forwarded-for (less trusted, but better than nothing)
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return "unknown";
}

/**
 * Get client IP from Next.js server component / route handler context
 * using the headers() API. Same trust logic as getClientIp.
 */
export async function getClientIpFromHeaders(): Promise<string> {
  const h = await headers();

  const vercelForwarded = h.get("x-vercel-forwarded-for");
  if (vercelForwarded) return vercelForwarded.split(",")[0]?.trim() || "unknown";

  const cfConnecting = h.get("cf-connecting-ip");
  if (cfConnecting) return cfConnecting.trim();

  const realIp = h.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";

  return "unknown";
}
