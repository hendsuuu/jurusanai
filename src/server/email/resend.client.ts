import { Resend } from "resend";
import { env } from "@/lib/env";

let cached: Resend | null = null;

/**
 * Lazy-init the Resend client. Returns null when API key is missing
 * so callers can degrade gracefully (mark email as FAILED + continue).
 */
export function getResendClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!cached) {
    cached = new Resend(env.RESEND_API_KEY);
  }
  return cached;
}
