export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return `Rp${Math.round(value).toLocaleString("id-ID")}`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDateOnly(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatPercentage(value: number, fractionDigits = 1): string {
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatMonthDecimal(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "-";
  return `${value.toFixed(1).replace(".", ",")} bulan`;
}

export function truncate(value: string, max = 80): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}
