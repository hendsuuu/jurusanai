"use client";

import { useState } from "react";
import { FileText, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useGeneratePlanPdf } from "../hooks/use-admin-queries";

/**
 * Button for admin to manually (re)generate a PDF for a paid plan.
 * Uses TanStack mutation for proper cache invalidation — no full page
 * reload needed. Shows confirmation dialog before re-generation since
 * it triggers a fresh AI render and email send.
 */
export function AdminGeneratePdfButton({
  planId,
  currentStatus,
  hasPaidOrder,
}: {
  planId: string;
  currentStatus: string;
  hasPaidOrder: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mutation = useGeneratePlanPdf(planId);

  const canGenerate =
    hasPaidOrder &&
    ["PAID", "GENERATED", "FAILED", "PDF_READY"].includes(currentStatus);

  if (!canGenerate) return null;

  const isRetry = currentStatus === "FAILED" || currentStatus === "PDF_READY";

  function handleConfirm() {
    mutation.mutate(undefined, {
      onSuccess: (data) => {
        if (data.email?.ok) {
          toast.success("PDF berhasil digenerate dan email terkirim ke customer.");
        } else {
          toast.success("PDF berhasil digenerate.");
          if (data.email?.error) {
            toast.warning(`Email tidak terkirim: ${data.email.error}`);
          }
        }
        setConfirmOpen(false);
      },
      onError: (err: Error) => {
        toast.error(err.message || "Gagal generate PDF");
      },
    });
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setConfirmOpen(true)}
        loading={mutation.isPending}
        variant={isRetry ? "outline" : "primary"}
        size="sm"
      >
        {isRetry ? (
          <RotateCw className="w-3.5 h-3.5" />
        ) : (
          <FileText className="w-3.5 h-3.5" />
        )}
        {isRetry ? "Re-generate PDF" : "Generate PDF"}
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          if (!mutation.isPending) setConfirmOpen(false);
        }}
        onConfirm={handleConfirm}
        title={isRetry ? "Re-generate PDF?" : "Generate PDF?"}
        description={
          isRetry
            ? "Sistem akan generate ulang PDF dan otomatis kirim email ke customer. Versi PDF lama akan ditimpa."
            : "Sistem akan generate PDF full report dan otomatis kirim email ke customer."
        }
        confirmLabel={mutation.isPending ? "Memproses…" : "Ya, lanjutkan"}
        cancelLabel="Batal"
        variant="warning"
        loading={mutation.isPending}
      />
    </>
  );
}
