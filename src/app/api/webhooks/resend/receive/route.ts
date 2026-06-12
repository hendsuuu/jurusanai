import { type NextRequest, NextResponse } from "next/server";
import { processInboundEmail } from "@/server/support/support.service";
import { env } from "@/lib/env";
import { logger } from "@/server/utils/logger";
import { webhookLimiter, rateLimitOrThrow } from "@/server/rate-limit/limiter";
import { getClientIp } from "@/server/rate-limit/keys";
import crypto from "node:crypto";

/**
 * POST /api/webhooks/resend/receive
 *
 * Receives inbound email events from Resend. When a user sends an email
 * to support@juruscope.id, Resend forwards the `email.received` event
 * here. The handler creates a support ticket or appends to an existing
 * one if the subject contains a ticket number.
 *
 * Security:
 * - In production, RESEND_WEBHOOK_SECRET is REQUIRED.
 * - Validates Svix webhook signature (svix-id, svix-timestamp, svix-signature).
 * - Rate limited to prevent abuse.
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limit webhooks
    const ip = getClientIp(req);
    await rateLimitOrThrow(webhookLimiter, `resend-webhook:${ip}`);

    // ── Signature verification ─────────────────────────────────────────
    const isProduction = env.NODE_ENV === "production";
    const webhookSecret = env.RESEND_WEBHOOK_SECRET;

    if (isProduction && !webhookSecret) {
      logger.error("[webhook:resend] RESEND_WEBHOOK_SECRET not configured in production!");
      return NextResponse.json(
        { message: "Webhook not configured" },
        { status: 500 }
      );
    }

    if (webhookSecret) {
      const svixId = req.headers.get("svix-id");
      const svixTimestamp = req.headers.get("svix-timestamp");
      const svixSignature = req.headers.get("svix-signature");

      if (!svixId || !svixTimestamp || !svixSignature) {
        logger.warn("[webhook:resend] Missing Svix headers");
        return NextResponse.json(
          { message: "Missing webhook signature headers" },
          { status: 401 }
        );
      }

      // Verify timestamp is within 5 minutes to prevent replay attacks
      const timestampSeconds = parseInt(svixTimestamp, 10);
      const now = Math.floor(Date.now() / 1000);
      if (isNaN(timestampSeconds) || Math.abs(now - timestampSeconds) > 300) {
        logger.warn("[webhook:resend] Timestamp too old or invalid", { svixTimestamp });
        return NextResponse.json(
          { message: "Webhook timestamp expired" },
          { status: 401 }
        );
      }

      // Read body as text for signature verification
      const bodyText = await req.text();

      // Verify HMAC signature
      // Svix signs: "${svix_id}.${svix_timestamp}.${body}"
      // Secret format from Resend: "whsec_<base64_key>"
      const secretBytes = Buffer.from(
        webhookSecret.startsWith("whsec_")
          ? webhookSecret.slice(6)
          : webhookSecret,
        "base64"
      );

      const signedContent = `${svixId}.${svixTimestamp}.${bodyText}`;
      const expectedSignature = crypto
        .createHmac("sha256", secretBytes)
        .update(signedContent)
        .digest("base64");

      // Svix sends multiple signatures separated by space, each prefixed with "v1,"
      const signatures = svixSignature.split(" ");
      const isValid = signatures.some((sig) => {
        const sigValue = sig.startsWith("v1,") ? sig.slice(3) : sig;
        return crypto.timingSafeEqual(
          Buffer.from(expectedSignature),
          Buffer.from(sigValue)
        );
      });

      if (!isValid) {
        logger.warn("[webhook:resend] Invalid signature");
        return NextResponse.json(
          { message: "Invalid webhook signature" },
          { status: 401 }
        );
      }

      // Parse the verified body
      const event = JSON.parse(bodyText);
      return await handleEvent(event);
    }

    // Development: no secret configured, parse body directly
    // (only allowed in non-production)
    if (isProduction) {
      return NextResponse.json(
        { message: "Webhook secret required in production" },
        { status: 401 }
      );
    }

    const event = await req.json().catch(() => null);
    return await handleEvent(event);
  } catch (error) {
    if ((error as { message?: string }).message === "Too many requests") {
      return NextResponse.json({ message: "Rate limited" }, { status: 429 });
    }
    logger.error("Resend inbound webhook failed", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleEvent(event: unknown) {
  if (!event || typeof event !== "object") {
    return NextResponse.json(
      { message: "Invalid payload" },
      { status: 400 }
    );
  }

  const evt = event as { type?: string; data?: Record<string, unknown> };

  // Only process email.received events
  if (evt.type !== "email.received") {
    return NextResponse.json(
      { message: "Event ignored" },
      { status: 200 }
    );
  }

  const data = evt.data;
  if (!data) {
    return NextResponse.json(
      { message: "No data in event" },
      { status: 200 }
    );
  }

  // Extract email fields from Resend payload
  const fromRaw = data.from as string | { email?: string; address?: string; name?: string } | undefined;
  const fromEmail =
    typeof fromRaw === "string"
      ? fromRaw
      : fromRaw?.email ?? fromRaw?.address ?? null;
  const fromName =
    typeof fromRaw === "object" ? fromRaw?.name ?? null : null;

  if (!fromEmail) {
    return NextResponse.json(
      { message: "No sender email" },
      { status: 200 }
    );
  }

  const toArray: unknown[] = Array.isArray(data.to) ? data.to : [];
  const isSupportEmail = toArray.some((item) => {
    const email = typeof item === "string" ? item : (item as { email?: string })?.email;
    return email === env.SUPPORT_EMAIL;
  });

  if (!isSupportEmail) {
    return NextResponse.json(
      { message: "Email target not support address" },
      { status: 200 }
    );
  }

  const emailId = (data.email_id ?? data.id ?? null) as string | null;

  // Try to fetch full email content from Resend Receiving API
  let messageText: string | null = null;
  let messageHtml: string | null = null;

  if (emailId) {
    try {
      const response = await fetch(
        `https://api.resend.com/emails/receiving/${emailId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const emailData = await response.json();
        messageText = emailData.text ?? emailData.text_body ?? null;
        messageHtml = emailData.html ?? emailData.html_body ?? null;
        logger.info("[webhook:resend] Fetched email body via Receiving API", {
          emailId,
          hasText: Boolean(messageText),
          hasHtml: Boolean(messageHtml),
        });
      } else {
        const errBody = await response.text().catch(() => "");
        logger.warn(
          `[webhook:resend] Receiving API returned ${response.status}: ${errBody}`
        );
      }
    } catch (fetchErr) {
      logger.warn(
        "[webhook:resend] Failed to fetch email body from Resend Receiving API",
        fetchErr
      );
    }
  }

  // Fallback: check if body was included in webhook payload directly
  if (!messageText && !messageHtml) {
    messageText = (data.text ?? data.text_body ?? data.body ?? null) as string | null;
    messageHtml = (data.html ?? data.html_body ?? null) as string | null;
  }

  const result = await processInboundEmail({
    resendEmailId: emailId ?? undefined,
    fromEmail,
    fromName: fromName ?? undefined,
    toEmail: env.SUPPORT_EMAIL,
    subject: (data.subject as string) ?? "(No Subject)",
    messageText,
    messageHtml,
  });

  logger.info("[webhook:resend] Processed inbound email", {
    from: fromEmail,
    subject: data.subject,
    emailId,
    result,
  });

  return NextResponse.json({ received: true, ...result }, { status: 200 });
}
