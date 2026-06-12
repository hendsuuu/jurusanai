"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { CurrencyText } from "@/components/shared/currency-text";
import { formatDate } from "@/lib/format";
import {
  useAdminOrderDetail,
  useResendOrderEmail,
  useRetryOrderGenerate,
  useRegenerateOrderPdf,
} from "../hooks/use-admin-queries";

export function OrderDetailView({ orderId }: { orderId: string }) {
  const query = useAdminOrderDetail(orderId);
  const resend = useResendOrderEmail(orderId);
  const retry = useRetryOrderGenerate(orderId);
  const regenerate = useRegenerateOrderPdf(orderId);

  if (query.isLoading) {
    return <LoadingState message="Memuat detail order…" />;
  }
  if (query.isError || !query.data) {
    return <ErrorState onRetry={() => query.refetch()} />;
  }

  const { order } = query.data;
  const email = order.email;

  // Resend is allowed only when PDF is ready and we have a customer email.
  // Status of the PDF render lives on businessPlan.status, not on order.
  const planStatus = order.discoveryResult?.status;
  const pdfReady = planStatus === "PDF_READY";
  const orderPaid = order.status === "SUCCESS";
  const canResend = pdfReady && Boolean(email.to) && !resend.isPending;
  // Retry full pipeline is meaningful only when paid + previous run failed
  // OR plan is stuck mid-flight (PAID/GENERATING). PDF_READY orders should
  // use regenerate-pdf instead.
  const canRetry =
    orderPaid &&
    (planStatus === "FAILED" ||
      planStatus === "PAID" ||
      planStatus === "GENERATING") &&
    !retry.isPending;
  // Regenerate PDF — works for PDF_READY (re-render), FAILED (retry only PDF
  // when AI plan already exists), or GENERATED.
  const canRegenerate =
    orderPaid &&
    (planStatus === "PDF_READY" ||
      planStatus === "FAILED" ||
      planStatus === "GENERATED") &&
    !regenerate.isPending;

  async function handleResend() {
    try {
      await resend.mutateAsync();
      toast.success("Email berhasil dikirim ulang.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim ulang email";
      toast.error(msg);
    }
  }

  async function handleRetry() {
    try {
      const result = await retry.mutateAsync();
      const modeLabel =
        result.dispatchMode === "queue" ? "antrean Inngest" : "synchronous (dev)";
      toast.success(`Pipeline business plan dikirim ke ${modeLabel}.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal retry generate";
      toast.error(msg);
    }
  }

  async function handleRegenerate() {
    try {
      const result = await regenerate.mutateAsync();
      const modeLabel =
        result.dispatchMode === "queue" ? "antrean Inngest" : "synchronous (dev)";
      toast.success(`Regenerate PDF dikirim ke ${modeLabel}.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal regenerate PDF";
      toast.error(msg);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900:text-slate-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Orders
      </Link>

      <Container variant="default" className="px-0">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Order
            </p>
            <h1 className="text-2xl font-bold font-mono text-slate-900">
              {order.orderCode}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{order.packageType}</Badge>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </Container>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 space-y-3">
          <h2 className="font-semibold text-slate-900">
            Customer
          </h2>
          <Field label="Nama" value={order.customerName} />
          <Field label="Email" value={order.customerEmail} />
          <Field label="Phone" value={order.customerPhone} />
          {order.user ? (
            <Field label="Linked User" value={order.user.email} />
          ) : null}
        </Card>

        <Card className="p-5 space-y-3">
          <h2 className="font-semibold text-slate-900">
            Pembayaran
          </h2>
          <Field label="Provider" value={order.paymentProvider} />
          <Field label="Total" value={<CurrencyText value={order.amount} />} />
          <Field
            label="Paid At"
            value={order.paidAt ? formatDate(order.paidAt) : "-"}
          />
          <Field
            label="Reference"
            value={order.providerReference ?? "-"}
            mono
          />
        </Card>

        <Card className="p-5 space-y-3">
          <h2 className="font-semibold text-slate-900">
            Hasil Analisis
          </h2>
          <Field label="Personality" value={order.discoveryResult?.personalityTitle} />
          <Field label="Minat" value={order.discoveryResult?.interestArea} />
          <Field
            label="Status Hasil"
            value={
              order.discoveryResult ? (
                <StatusBadge status={order.discoveryResult.status} />
              ) : (
                "-"
              )
            }
          />
          <Field
            label="PDF"
            value={
              order.discoveryResult?.pdfUrl ? (
                <a
                  href={order.discoveryResult.pdfUrl}
                  className="text-brand-700 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Buka PDF
                </a>
              ) : (
                "-"
              )
            }
          />
        </Card>
      </div>

      {/* Pipeline actions (admin retry / regenerate) */}
      <Card className="p-5">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-slate-900">
              Pipeline Background Job
            </h2>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <StatusBadge status={planStatus ?? "DRAFT"} />
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500 max-w-3xl">
          Pipeline post-payment menjalankan AI plan → PDF render → upload R2 →
          email. Retry mengirim ulang seluruh pipeline dari awal. Regenerate PDF
          hanya merender ulang PDF (skip AI jika plan sudah ada).
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={!canRetry}
            loading={retry.isPending}
            title={
              !orderPaid
                ? "Order belum dibayar"
                : planStatus === "PDF_READY"
                  ? "Plan sudah PDF Ready — gunakan Regenerate PDF"
                  : "Kirim ulang pipeline lengkap"
            }
          >
            <RotateCw className="w-3.5 h-3.5" />
            Retry Pipeline
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={!canRegenerate}
            loading={regenerate.isPending}
            title={
              !orderPaid
                ? "Order belum dibayar"
                : "Render ulang PDF saja (skip AI jika sudah ada)"
            }
          >
            <FileText className="w-3.5 h-3.5" />
            Regenerate PDF
          </Button>
        </div>

        {planStatus === "FAILED" ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <p>
              Pipeline gagal — cek audit log atau Inngest dashboard untuk error
              detail, lalu klik Retry Pipeline.
            </p>
          </div>
        ) : null}
        {planStatus === "GENERATING" ? (
          <p className="mt-3 text-xs text-slate-500 inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Pipeline sedang berjalan. Refresh akan auto-update saat selesai.
          </p>
        ) : null}
      </Card>

      {/* Email Delivery */}
      <Card className="p-5">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-slate-900">
              Pengiriman Email
            </h2>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <EmailStatusBadge status={email.status} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={!canResend}
              loading={resend.isPending}
              title={
                !pdfReady
                  ? "PDF belum siap"
                  : !email.to
                    ? "Email customer kosong"
                    : "Kirim ulang email"
              }
            >
              <RotateCw className="w-3.5 h-3.5" />
              Kirim ulang
            </Button>
          </div>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <Field label="Dikirim ke" value={email.to ?? "-"} />
          <Field
            label="Terkirim pada"
            value={email.sentAt ? formatDate(email.sentAt) : "-"}
          />
          <Field
            label="Jumlah Percobaan"
            value={String(email.attempts ?? 0)}
          />
          <Field
            label="Resend Message ID"
            value={email.messageId ?? "-"}
            mono
          />
        </div>

        {email.error ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Error terakhir</p>
              <p className="mt-0.5 break-words">{email.error}</p>
            </div>
          </div>
        ) : null}
        {!pdfReady ? (
          <p className="mt-3 text-xs text-slate-500">
            Email hanya bisa dikirim setelah PDF full report tergenerate.
          </p>
        ) : null}
      </Card>

      <details className="rounded-2xl border border-slate-200 bg-white">
        <summary className="cursor-pointer p-5 font-semibold text-slate-900">
          Raw Payment Response
        </summary>
        <pre className="px-5 pb-5 text-xs overflow-auto max-h-[400px] text-slate-700">
          {JSON.stringify(order.rawPaymentResponse, null, 2)}
        </pre>
      </details>

      <details className="rounded-2xl border border-slate-200 bg-white">
        <summary className="cursor-pointer p-5 font-semibold text-slate-900">
          Raw Webhook Payload
        </summary>
        <pre className="px-5 pb-5 text-xs overflow-auto max-h-[400px] text-slate-700">
          {JSON.stringify(order.rawWebhookPayload, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function EmailStatusBadge({
  status,
}: {
  status: "PENDING" | "SENT" | "FAILED" | "BOUNCED" | null;
}) {
  if (!status) {
    return (
      <Badge variant="neutral">
        <Clock className="w-3 h-3" />
        Belum dikirim
      </Badge>
    );
  }
  if (status === "SENT") {
    return (
      <Badge variant="success">
        <CheckCircle2 className="w-3 h-3" />
        Terkirim
      </Badge>
    );
  }
  if (status === "FAILED") {
    return (
      <Badge variant="danger">
        <AlertTriangle className="w-3 h-3" />
        Gagal
      </Badge>
    );
  }
  if (status === "BOUNCED") {
    return (
      <Badge variant="warning">
        <AlertTriangle className="w-3 h-3" />
        Bounced
      </Badge>
    );
  }
  return (
    <Badge variant="warning">
      <Clock className="w-3 h-3" />
      Pending
    </Badge>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={`col-span-2 text-slate-900 truncate ${mono ? "font-mono text-xs" : ""}`}
      >
        {value || "-"}
      </dd>
    </div>
  );
}
