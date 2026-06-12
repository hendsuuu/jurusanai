"use client";

import { Container } from "@/components/ui/container";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const FEATURED = {
  name: "Rina Kusuma",
  role: "Siswa SMA Kelas 12, Bandung",
  avatar: "RK",
  quote:
    "Personality identity-ku 'Creative Strategist' dan penjelasannya akurat banget. Aku jadi ngerti kenapa cara kerjaku selalu mulai dari konsep besar dulu baru eksekusi. Langsung aku share ke semua temen-temen yang masih galau pilih jurusan.",
};

const GRID_TESTIMONIALS = [
  {
    name: "Raka",
    role: "Siswa SMA Kelas 12",
    avatar: "RK",
    quote: "Awalnya bingung banget mau ambil jurusan apa. Setelah analisis, hasilnya relate banget sama diriku.",
  },
  {
    name: "Dinda",
    role: "Kelas 11",
    avatar: "DN",
    quote: "Pertanyaannya santai, nggak kayak psikotes. Tapi hasilnya bikin aku mikir 'iya ini gue banget'.",
  },
  {
    name: "Arif",
    role: "Gap Year",
    avatar: "AR",
    quote: "Report PDF-nya lengkap. Aku jadi tau jurusan dan arah karir yang cocok sama cara berpikirku.",
  },
  {
    name: "Sari Wulandari",
    role: "Kelas 12, Yogyakarta",
    avatar: "SW",
    quote: "Aku yang tadinya ragu, sekarang lebih yakin sama pilihan jurusanku. Warning area-nya juga ngebantu.",
  },
  {
    name: "Dimas Prasetyo",
    role: "Kelas 12, Semarang",
    avatar: "DP",
    quote: "Yang bikin beda: hasilnya personal, bukan jawaban template. Future lifestyle-nya menarik banget.",
  },
  {
    name: "Maya",
    role: "Kelas 11",
    avatar: "MY",
    quote: "Akhirnya ngerti kenapa aku punya cara berpikir kayak gini. Skill roadmap-nya juga aku simpan.",
  },
];

const STATS = [
  { value: "4.9", unit: "/ 5", label: "Rating rata-rata" },
  { value: "500+", unit: "", label: "Peserta aktif" },
  { value: "30+", unit: "", label: "Kota di Indonesia" },
];

export function TestimonialMarquee() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <Container>

        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4 }}
        >
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#4B5320] uppercase tracking-wider mb-4">
            <span className="w-6 h-0.5 bg-[#C9A24E]" />
            Testimonial
            <span className="w-6 h-0.5 bg-[#C9A24E]" />
          </span>
          <h2 className="text-3xl sm:text-[44px] font-extrabold tracking-tight text-[#2A311A] leading-tight">
            Dibuat untuk Gen Z yang ingin yakin dengan pilihan masa depannya.
          </h2>
          <p className="mt-4 text-[#57604A] text-lg leading-relaxed">
            Cocok untuk siswa SMA, gap year, dan siapa pun yang ingin mengenal dirinya sebelum menentukan jurusan.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#2A311A] leading-none">
                {s.value}
                {s.unit && <span className="text-xl text-[#8A8A72] font-normal ml-0.5">{s.unit}</span>}
              </div>
              <p className="text-xs text-[#8A8A72] mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Featured testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45 }}
          className="relative rounded-2xl bg-[#2A311A] overflow-hidden mb-6 p-7 sm:p-10"
        >
          {/* Decorative quote mark */}
          <div
            aria-hidden
            className="absolute -top-4 left-6 text-[120px] leading-none font-serif text-[#C9A24E]/15 select-none pointer-events-none"
          >
            &ldquo;
          </div>

          {/* Decorative circle */}
          <div
            aria-hidden
            className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-[#C9A24E]/8 pointer-events-none"
          />

          <div className="relative flex flex-col sm:flex-row sm:items-end gap-6">
            <blockquote className="flex-1">
              <p className="text-lg sm:text-xl text-white/90 font-medium leading-relaxed">
                &ldquo;{FEATURED.quote}&rdquo;
              </p>
            </blockquote>

            <div className="flex items-center gap-3 sm:shrink-0 sm:flex-col sm:items-end">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-[#C9A24E] text-[#C9A24E]" />
                ))}
              </div>
              <div className="flex items-center gap-2.5 sm:flex-row-reverse">
                <div className="w-9 h-9 rounded-lg bg-[#C9A24E]/20 border border-[#C9A24E]/30 flex items-center justify-center text-xs font-bold text-[#C9A24E]">
                  {FEATURED.avatar}
                </div>
                <div className="sm:text-right">
                  <p className="text-sm font-bold text-[#C9A24E]">{FEATURED.name}</p>
                  <p className="text-[11px] text-white/40">{FEATURED.role}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Testimonial grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {GRID_TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: (i % 3) * 0.08 }}
            >
              <div className="group h-full rounded-xl border border-[#E6E3D0] bg-white p-5 flex flex-col hover:border-[#CDD2A8] hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-[#B58E3C] text-[#B58E3C]" />
                    ))}
                  </div>
                  <Quote className="w-4 h-4 text-[#DDD9BD] group-hover:text-[#CDD2A8] transition-colors" />
                </div>

                <p className="text-sm text-[#3F4A2E] leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center gap-2.5 mt-4 pt-3.5 border-t border-[#F0EDE0]">
                  <div className="w-8 h-8 rounded-lg bg-[#E6E8D2] border border-[#CDD2A8] flex items-center justify-center text-[10px] font-bold text-[#4B5320] shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#2A311A]">{t.name}</p>
                    <p className="text-[10px] text-[#8A8A72]">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </Container>
    </section>
  );
}
