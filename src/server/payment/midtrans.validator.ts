import crypto from "node:crypto";
import { env } from "@/lib/env";
import { logger } from "@/server/utils/logger";

export type MidtransSignaturePayload = {
  order_id: string;
  status_code: string;
  gross_amount: string;
};

/**
 * Compute the expected signature key for a Midtrans webhook payload using
 * the merchant server key.
 *
 * Formula: SHA512(order_id + status_code + gross_amount + server_key)
 *
 * IMPORTANT: gross_amount from Midtrans is always a string like "49000.00"
 * (with decimals). The signature must use the exact same string.
 *
 * See: https://docs.midtrans.com/reference/notification-webhook
 */
export function createMidtransSignature(payload: MidtransSignaturePayload) {
  const raw =
    payload.order_id +
    payload.status_code +
    payload.gross_amount +
    env.MIDTRANS_SERVER_KEY;
  return crypto.createHash("sha512").update(raw).digest("hex");
}

export function verifyMidtransSignature(
  payload: MidtransSignaturePayload,
  signatureKey: string
): boolean {
  if (!signatureKey || typeof signatureKey !== "string") {
    logger.warn("Midtrans signature verification: empty signature_key");
    return false;
  }

  const expected = createMidtransSignature(payload);

  // Simple string comparison first (both are hex strings)
  // Use timing-safe comparison to prevent timing attacks
  if (expected.length !== signatureKey.length) {
    logger.warn("Midtrans signature length mismatch", {
      expectedLen: expected.length,
      receivedLen: signatureKey.length,
    });
    return false;
  }

  try {
    // Both are hex strings of SHA-512 (128 chars), compare as UTF-8 buffers
    const expectedBuf = Buffer.from(expected, "utf8");
    const receivedBuf = Buffer.from(signatureKey, "utf8");
    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
  } catch (err) {
    logger.error("Midtrans signature comparison error", err);
    return false;
  }
}
