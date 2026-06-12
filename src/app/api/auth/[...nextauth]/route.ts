import type { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { authLimiter, rateLimitOrThrow } from "@/server/rate-limit/limiter";
import { getClientIp } from "@/server/rate-limit/keys";
import { NextResponse } from "next/server";

export const GET = handlers.GET;

/**
 * POST handler for Auth.js with rate limiting on credentials login.
 * This prevents brute-force attacks on the admin login.
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limit all POST requests to auth (login attempts)
    const ip = getClientIp(req);
    await rateLimitOrThrow(authLimiter, `auth-login:${ip}`);
  } catch {
    // Rate limited
    return NextResponse.json(
      { message: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  // Delegate to Auth.js handler
  return handlers.POST(req);
}
