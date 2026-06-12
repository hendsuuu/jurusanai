"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Compass, Brain, GraduationCap, Heart } from "lucide-react";
import { Container } from "@/components/ui/container";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden text-white h-[100svh] flex items-center"
      style={{
        background:
          "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.18), transparent 28%), linear-gradient(135deg, #4B5320 0%, #2F3A22 100%)",
      }}
    >
      {/* Background pattern */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[140px] translate-y-1/3 -translate-x-1/4"
        style={{ background: "rgba(201, 162, 78, 0.18)" }}
      />

      <Container className="relative pt-20 pb-8 sm:pt-24 lg:pt-16 lg:pb-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm font-medium text-white/95 mb-7 backdrop-blur-sm">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#C9A24E] text-[#2A311A] text-xs font-bold">
                <Sparkles className="w-3 h-3" />
                BETA
              </span>
              AI Self Discovery untuk Gen Z
            </div>

            <h1 className="text-[40px] sm:text-[54px] lg:text-[64px] font-extrabold leading-[1.04] tracking-tight">
              Banyak orang salah jurusan.{" "}
              <span className="bg-gradient-to-r from-white to-[#E4D9A8] bg-clip-text text-transparent">
                Jangan sampai kamu jadi salah satunya.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-white/78 max-w-xl leading-relaxed">
              Jawab 50 pertanyaan ringan dan temukan kepribadian, jurusan, serta arah masa depan yang paling cocok buatmu. Kenali dirimu sebelum menentukan masa depan.
            </p>

            <div className="mt-9 flex flex-wrap gap-3 sm:gap-4">
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
                Lihat Contoh
              </Link>
            </div>

            <p className="mt-7 text-xs sm:text-sm text-white/60">
              Gratis sampai hasil utama. Bukan psikotes formal — ini cara seru mengenal dirimu.
            </p>
          </motion.div>

          {/* Right — Floating mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="hidden lg:block relative"
          >
            {/* Main card */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/18 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
              <div className="rounded-xl bg-white overflow-hidden shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                {/* Gold accent bar */}
                <div className="h-1.5 bg-[#C9A24E]" />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-[#4B5320] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#2A311A]">Creative Strategist</p>
                      <p className="text-[11px] text-[#8A8A72]">Personality identity kamu</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <MockRecommendation rank={1} name="Desain Komunikasi Visual" score={94} icon={<Compass className="w-3.5 h-3.5" />} />
                    <MockRecommendation rank={2} name="Ilmu Komunikasi" score={89} icon={<Brain className="w-3.5 h-3.5" />} />
                    <MockRecommendation rank={3} name="Marketing / Bisnis Digital" score={85} icon={<GraduationCap className="w-3.5 h-3.5" />} />
                    <MockRecommendation rank={4} name="Psikologi" score={80} icon={<Heart className="w-3.5 h-3.5" />} />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating mini cards */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 rounded-xl bg-white border-l-4 border-[#C9A24E] shadow-[0_12px_32px_rgba(15,23,42,0.12)] px-4 py-3"
            >
              <p className="text-[10px] uppercase tracking-wider text-[#8A8A72] font-semibold">Gaya Berpikir</p>
              <p className="text-lg font-extrabold text-[#2A311A]">Kreatif + Eksploratif</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-3 -left-4 rounded-xl bg-white border-l-4 border-[#4B7A2F] shadow-[0_12px_32px_rgba(15,23,42,0.12)] px-4 py-3"
            >
              <p className="text-[10px] uppercase tracking-wider text-[#8A8A72] font-semibold">Full Report</p>
              <p className="text-sm font-bold text-[#4B7A2F]">✓ Siap dibuka</p>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function MockRecommendation({ rank, name, score, icon }: { rank: number; name: string; score: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#DDD9BD] bg-[#F6F4E9] px-3 py-2.5">
      <div className="w-6 h-6 rounded-md bg-[#4B5320] flex items-center justify-center text-[11px] font-bold text-white shrink-0">
        {rank}
      </div>
      <div className="w-7 h-7 rounded-md bg-[#E6E8D2] flex items-center justify-center text-[#4B5320] shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#2A311A] truncate">{name}</p>
      </div>
      <div className="text-xs font-bold text-[#4B5320] bg-[#E6E8D2] px-2 py-0.5 rounded-md shrink-0">
        {score}%
      </div>
    </div>
  );
}
