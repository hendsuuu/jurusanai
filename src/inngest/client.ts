import { Inngest } from "inngest";
import { env } from "@/lib/env";

/**
 * Singleton Inngest client.
 *
 * Application identifier: "juruscope-ai"
 *
 * - In development without INNGEST_EVENT_KEY: connects to local Dev Server (`npx inngest-cli@latest dev`)
 * - In production: requires INNGEST_EVENT_KEY for event sending and INNGEST_SIGNING_KEY for serve route auth
 */
export const inngest = new Inngest({
  id: "juruscope-ai",
  ...(env.INNGEST_EVENT_KEY ? { eventKey: env.INNGEST_EVENT_KEY } : {}),
});

/**
 * True when Inngest is configured for production-grade event delivery.
 * Used to decide between dispatching events and the synchronous fallback.
 */
export const isInngestConfigured = Boolean(env.INNGEST_EVENT_KEY);

/**
 * True when synchronous fallback is allowed. Only in non-production AND
 * when the user explicitly opts in via ENABLE_SYNC_FALLBACK=true.
 */
export const isSyncFallbackAllowed =
  env.NODE_ENV !== "production" && env.ENABLE_SYNC_FALLBACK;
