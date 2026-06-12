/**
 * Test checking transaction status from Midtrans Core API.
 * Run: npx tsx scripts/test-midtrans-status.ts ORDER-CODE-HERE
 */
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import { Snap } from "midtrans-client";

const serverKey = process.env.MIDTRANS_SERVER_KEY!;
const clientKey = process.env.MIDTRANS_CLIENT_KEY!;
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

const orderCode = process.argv[2];
if (!orderCode) {
  console.log("Usage: npx tsx scripts/test-midtrans-status.ts ORDER-CODE");
  console.log("Example: npx tsx scripts/test-midtrans-status.ts ORDER-1779170205253-abc12345");
  process.exit(1);
}

const snap = new Snap({ isProduction, serverKey, clientKey });

console.log(`Checking status for: ${orderCode}`);
console.log(`Endpoint: https://api.sandbox.midtrans.com/v2/${orderCode}/status`);
console.log("");

const transaction = (snap as unknown as { transaction: { status: (id: string) => Promise<unknown> } }).transaction;

transaction
  .status(orderCode)
  .then((result: unknown) => {
    console.log("✅ Midtrans transaction status:");
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error: unknown) => {
    const err = error as { message?: string; httpStatusCode?: number; ApiResponse?: unknown };
    console.error("❌ Error:");
    console.error("  Message:", err.message);
    console.error("  HTTP Status:", err.httpStatusCode);
    console.error("  API Response:", JSON.stringify(err.ApiResponse, null, 2));
  });
