import { Snap } from "midtrans-client";
import { env } from "@/lib/env";
import { AppError } from "@/server/utils/error";

/**
 * Lazily-initialized Midtrans Snap client. The client uses the Snap Redirect
 * flow — `createTransaction` returns a `token` and `redirect_url`.
 *
 * The server key MUST stay on the server only. It is never exposed to clients.
 */
let snapInstance: Snap | null = null;

export function getSnapClient(): Snap {
  if (!snapInstance) {
    if (!env.MIDTRANS_SERVER_KEY) {
      throw new AppError(
        "INTERNAL_ERROR",
        "MIDTRANS_SERVER_KEY belum dikonfigurasi di .env",
        500
      );
    }
    snapInstance = new Snap({
      isProduction: env.MIDTRANS_IS_PRODUCTION,
      serverKey: env.MIDTRANS_SERVER_KEY,
      clientKey: env.MIDTRANS_CLIENT_KEY,
    });
  }
  return snapInstance;
}
