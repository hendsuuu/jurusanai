"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="p-8 text-center space-y-3">
      <h2 className="text-lg font-semibold">Bagian dashboard ini error</h2>
      <p className="text-sm text-slate-600">
        Coba muat ulang. Kalau masih error, cek log server.
      </p>
      {error?.digest ? (
        <p className="text-[10px] text-slate-400 font-mono">ref: {error.digest}</p>
      ) : null}
      <Button onClick={reset}>Coba lagi</Button>
    </Card>
  );
}
