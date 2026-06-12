"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section
      className="py-20 sm:py-28 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #4B5320 0%, #3A4327 100%)" }}
    >
      {/* Background accents */}
      <div
        aria-hidden
        className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
        style={{ background: "rgba(255, 255, 255, 0.18)" }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full blur-[80px]"
        style={{ background: "rgba(201, 162, 78, 0.22)" }}
      />

      <Container className="relative">
        <motion.div
          className="max-w-3xl mx-auto rounded-2xl border-2 border-white/15 bg-white/[0.06] backdrop-blur-sm p-8 sm:p-12 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4 }}
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[#E4D9A8] uppercase tracking-[0.2em] mb-5">
            <span className="w-6 h-0.5 bg-[#C9A24E]" />
            Mulai Sekarang
            <span className="w-6 h-0.5 bg-[#C9A24E]" />
          </span>
          <h2 className="text-3xl sm:text-[42px] font-extrabold tracking-tight text-white leading-tight">
            Siap mengenal dirimu lebih dalam?
          </h2>
          <p className="mt-4 text-white/80 text-lg">
            Gratis sampai hasil utama. Bayar hanya kalau kamu penasaran dengan analisis lengkap tentang dirimu.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href="/planner"
              className="inline-flex items-center gap-2 h-[52px] px-7 sm:px-8 rounded-xl bg-[#C9A24E] text-[#2A311A] font-bold text-[15px] hover:bg-[#B58E3C] shadow-[0_10px_0_-2px_#8c6f2f] hover:translate-y-0.5 hover:shadow-[0_6px_0_-2px_#8c6f2f] transition-all duration-150"
            >
              Mulai Analisis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/examples"
              className="inline-flex items-center gap-2 h-[52px] px-7 sm:px-8 rounded-xl bg-transparent text-white font-semibold text-[15px] border border-white/30 hover:bg-white/10 transition-all duration-200"
            >
              Lihat Contoh Hasil
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
