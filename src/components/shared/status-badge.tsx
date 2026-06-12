import { Badge } from "@/components/ui/badge";

type AnyStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "EXPIRED"
  | "CANCELED"
  | "DRAFT"
  | "RECOMMENDED"
  | "SELECTED"
  | "GENERATED"
  | "PAID"
  | "GENERATING"
  | "PDF_READY";

const MAP: Record<
  AnyStatus,
  { label: string; variant: "success" | "warning" | "danger" | "info" | "neutral" }
> = {
  PENDING: { label: "Pending", variant: "warning" },
  SUCCESS: { label: "Success", variant: "success" },
  FAILED: { label: "Failed", variant: "danger" },
  EXPIRED: { label: "Expired", variant: "neutral" },
  CANCELED: { label: "Canceled", variant: "neutral" },
  DRAFT: { label: "Draft", variant: "neutral" },
  RECOMMENDED: { label: "Recommended", variant: "info" },
  SELECTED: { label: "Selected", variant: "info" },
  GENERATED: { label: "Generated", variant: "info" },
  // Plan status PAID == queued for AI/PDF pipeline. Show as info so user
  // sees that something is in motion (not "success" yet).
  PAID: { label: "Antri", variant: "info" },
  // Pipeline is actively running (AI gen / PDF render / upload / email).
  GENERATING: { label: "Sedang dibuat", variant: "info" },
  PDF_READY: { label: "PDF Siap", variant: "success" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = MAP[status as AnyStatus] ?? { label: status, variant: "neutral" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
