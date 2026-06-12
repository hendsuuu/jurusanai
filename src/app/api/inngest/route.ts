import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {
  generateBusinessPlan,
  regenerateBusinessPlanPdf,
} from "@/inngest/functions/generate-business-plan";
import { env } from "@/lib/env";

/**
 * Inngest serve route.
 *
 * Registers all background functions with the Inngest platform.
 * Inngest invokes these via HTTP when events are dispatched — each step
 * arrives as its own POST request, so this handler must be allowed to run
 * long enough to cover the slowest step (AI generation, ~30-90s).
 *
 * - GET: discovery + health check
 * - POST: function/step invocation (signed by Inngest in production)
 * - PUT: registration (used by Inngest CLI in dev, by dashboard in prod)
 */

// Vercel: cap at 300s (5 min) — Pro plan supports up to 800s, but 300 is
// the safe default that also works for AWS-backed serverless. Each step
// gets the full budget, so this is per-step, not per-pipeline.
export const maxDuration = 300;

// Force Node.js runtime — @react-pdf/renderer + Prisma + AWS SDK don't
// work on Edge runtime.
export const runtime = "nodejs";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateBusinessPlan, regenerateBusinessPlanPdf],
  ...(env.INNGEST_SIGNING_KEY ? { signingKey: env.INNGEST_SIGNING_KEY } : {}),
});
