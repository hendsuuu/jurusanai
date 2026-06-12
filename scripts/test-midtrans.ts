/**
 * Quick script to test Midtrans Snap sandbox connection.
 * Run: npx tsx scripts/test-midtrans.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import { Snap } from "midtrans-client";

const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

console.log("=== Midtrans Connection Test ===");
console.log(`Server Key: ${serverKey ? serverKey.substring(0, 15) + "..." : "(EMPTY)"}`);
console.log(`Client Key: ${clientKey ? clientKey.substring(0, 15) + "..." : "(EMPTY)"}`);
console.log(`Is Production: ${isProduction}`);
console.log("");

if (!serverKey) {
  console.error("❌ MIDTRANS_SERVER_KEY is empty. Set it in .env");
  process.exit(1);
}

const snap = new Snap({
  isProduction,
  serverKey,
  clientKey: clientKey || "",
});

const testOrderId = `TEST-${Date.now()}`;

const parameter = {
  transaction_details: {
    order_id: testOrderId,
    gross_amount: 25000,
  },
  customer_details: {
    first_name: "Test",
    email: "test@example.com",
    phone: "08123456789",
  },
  item_details: [
    {
      id: "test-item",
      price: 25000,
      quantity: 1,
      name: "Test Item",
    },
  ],
};

console.log("Sending createTransaction to Midtrans Sandbox...");
console.log(`Order ID: ${testOrderId}`);
console.log("");

snap
  .createTransaction(parameter as never)
  .then((result: unknown) => {
    console.log("✅ SUCCESS! Midtrans responded:");
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error: unknown) => {
    console.error("❌ FAILED! Error from Midtrans:");
    const err = error as {
      message?: string;
      httpStatusCode?: number;
      ApiResponse?: unknown;
      rawHttpClientData?: unknown;
    };
    console.error("  Message:", err.message);
    console.error("  HTTP Status:", err.httpStatusCode);
    console.error("  API Response:", JSON.stringify(err.ApiResponse, null, 2));
    if (err.rawHttpClientData) {
      const raw = err.rawHttpClientData as { data?: unknown };
      console.error("  Raw Data:", JSON.stringify(raw.data, null, 2));
    }
  });
