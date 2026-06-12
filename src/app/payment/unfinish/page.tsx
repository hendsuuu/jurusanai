import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Midtrans redirects here when user closes payment page without completing.
 * We redirect to our internal payment status page.
 */
export default async function PaymentUnfinishPage({
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
      redirect(`/payment/redirect/${order.id}`);
    }
  }

  return (
    <Container variant="narrow" className="py-10">
      <Card className="p-8 text-center space-y-3">
        <h1 className="text-xl font-semibold">Pembayaran belum selesai</h1>
        <p className="text-sm text-slate-600">
          Kamu bisa kembali dan menyelesaikan pembayaran nanti.
        </p>
        <Link href="/" className="text-brand-600 hover:underline text-sm">
          Kembali ke beranda
        </Link>
      </Card>
    </Container>
  );
}
