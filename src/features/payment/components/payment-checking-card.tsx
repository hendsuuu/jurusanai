"use client";

import { Loader2 } from "lucide-react";

export function PaymentCheckingCard() {
  return (
    <div className="rounded-3xl border border-[#CDD2A8] bg-white p-8 text-center space-y-3 shadow-[0_16px_40px_rgba(75,83,32,0.06)]">
      <div className="flex justify-center">
        <div className="rounded-full bg-[#E6E8D2] p-3.5 ring-4 ring-[#4B5320]/10">
          <Loader2 className="w-8 h-8 text-[#4B5320] animate-spin" aria-hidden />
        </div>
      </div>
      <h2 className="text-xl font-extrabold text-[#2A311A] tracking-tight">Mengecek status pembayaran…</h2>
      <p className="text-sm text-[#57604A] max-w-md mx-auto">
        Kami sedang mengecek status pembayaranmu. Jangan tutup halaman ini dulu.
      </p>
    </div>
  );
}
