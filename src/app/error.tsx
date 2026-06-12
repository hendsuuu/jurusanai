"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-10">
      <Container variant="narrow" className="max-w-md">
        <Card className="p-8 text-center space-y-4">
          <div className="flex justify-center">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-xl font-semibold">Terjadi kesalahan</h1>
          <p className="text-sm text-slate-600">
            Maaf, ada yang tidak beres. Coba lagi atau kembali ke beranda.
          </p>
          {error?.digest ? (
            <p className="text-[10px] text-slate-400 font-mono">
              ref: {error.digest}
            </p>
          ) : null}
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <Button variant="primary" onClick={reset}>
              Coba lagi
            </Button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 h-11 rounded-xl px-4 text-sm font-semibold border border-slate-200 hover:bg-slate-50"
            >
              Kembali ke beranda
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  );
}
