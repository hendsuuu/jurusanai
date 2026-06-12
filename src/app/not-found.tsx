import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-10">
      <Container variant="narrow" className="max-w-md">
        <Card className="p-8 text-center space-y-4">
          <div className="flex justify-center">
            <Compass className="w-10 h-10 text-brand-600" />
          </div>
          <h1 className="text-xl font-semibold">Halaman tidak ditemukan</h1>
          <p className="text-sm text-slate-600">
            Tautan yang kamu buka mungkin sudah dipindah atau salah ketik.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-11 rounded-xl px-6 text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700"
          >
            Kembali ke beranda
          </Link>
        </Card>
      </Container>
    </div>
  );
}
