import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicNav, PublicFooter } from "@/components/layout/public-nav";
import { LegalView } from "@/features/legal/legal-view";

export const metadata: Metadata = {
  title: "Legal & Kebijakan",
  description:
    "Syarat & Ketentuan, Kebijakan Privasi, dan Kebijakan Refund untuk layanan JuruScope.",
  alternates: {
    canonical: "/legal",
  },
};

export default function LegalPage() {
  return (
    <div className="flex flex-col flex-1">
      <PublicNav />
      <main className="flex-1">
        <Suspense fallback={<LegalFallback />}>
          <LegalView />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}

function LegalFallback() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center text-white"
      style={{
        background: "linear-gradient(135deg, #4B5320 0%, #3A4327 100%)",
      }}
    >
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <p className="mt-3 text-sm text-white/70">Memuat halaman…</p>
      </div>
    </section>
  );
}
