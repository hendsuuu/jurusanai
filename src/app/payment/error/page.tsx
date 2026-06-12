import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Midtrans redirects here when payment encounters an error.
 * We redirect to our internal payment failed page.
 */
export default async function PaymentErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const sp = await searchParams;
  const orderCode = sp.order_id;

  if (orderCode) {
    const order = await prisma.order.findUnique({
      where: { orderCode },
      select: { id: true },
    });
    if (order) {
      redirect(`/payment/failed/${order.id}`);
    }
  }

  return (
    <Container variant="narrow" className="py-10">
      <Card className="p-8 text-center space-y-3">
        <div className="flex justify-center">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-xl font-semibold">Pembayaran error</h1>
        <p className="text-sm text-slate-600">
          Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.
        </p>
        <Link href="/" className="text-brand-600 hover:underline text-sm">
          Kembali ke beranda
        </Link>
      </Card>
    </Container>
  );
}
