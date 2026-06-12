import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState({
  message = "Memuat…",
  rows = 3,
}: {
  message?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <p className="text-sm text-slate-500">{message}</p>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
