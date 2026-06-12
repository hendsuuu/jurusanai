import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Midtrans redirects user here after payment (finish/unfinish/error).
 * Query params from Midtrans: order_id, status_code, transaction_status
 *
 * We look up the order by orderCode and immediately redirect to the
 * internal success page. The success page itself polls for status until
 * the webhook (or check-status fallback) confirms payment + sends email.
 *
 * IMPORTANT: We do NOT trust these query params as proof of payment.
 * The real status comes from the webhook handler.
 */
export default async function PaymentFinishPage({
  searchParams,
}: {
  searchParams: Promise<{
    order_id?: string;
    status_code?: string;
    transaction_status?: string;
  }>;
}) {
  const sp = await searchParams;
  const orderCode = sp.order_id;

  if (!orderCode) {
    return (
      <Container variant="narrow" className="py-10">
        <Card className="p-8 text-center space-y-3">
          <h1 className="text-xl font-semibold">Pembayaran selesai</h1>
          <p className="text-sm text-slate-600">
            Tidak ada informasi order. Kembali ke beranda.
          </p>
          <Link href="/" className="text-brand-600 hover:underline text-sm">
            Kembali ke beranda
          </Link>
        </Card>
      </Container>
    );
  }

  // Look up order by orderCode to get the internal orderId
  const order = await prisma.order.findUnique({
    where: { orderCode },
    select: { id: true },
  });

  if (order) {
    // Skip the in-between "checking" view. The status page polls and
    // updates UI as soon as the webhook flips status to SUCCESS.
    redirect(`/payment/status/${order.id}`);
  }

  // Fallback if order not found
  return (
    <Container variant="narrow" className="py-10">
      <Card className="p-8 text-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-600" />
        <h1 className="text-xl font-semibold">Memproses pembayaran…</h1>
        <p className="text-sm text-slate-600">
          Order <code className="font-mono text-xs">{orderCode}</code> sedang
          diproses. Cek email kamu untuk konfirmasi.
        </p>
        <Link href="/" className="text-brand-600 hover:underline text-sm">
          Kembali ke beranda
        </Link>
      </Card>
    </Container>
  );
}
