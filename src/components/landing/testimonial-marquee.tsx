"use client";

import { Container } from "@/components/ui/container";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const TESTIMONIALS_ROW1 = [
  { name: "Raka", role: "Siswa SMA Kelas 12", avatar: "RK", quote: "Awalnya bingung banget mau ambil jurusan apa. Setelah analisis, hasilnya relate banget sama diriku." },
  { name: "Dinda", role: "Kelas 11", avatar: "DN", quote: "Pertanyaannya santai, nggak kayak psikotes. Tapi hasilnya bikin aku mikir 'iya ini gue banget'." },
  { name: "Arif", role: "Gap Year", avatar: "AR", quote: "Report PDF-nya lengkap. Aku jadi tau jurusan dan arah karir yang cocok sama cara berpikirku." },
  { name: "Rina Kusuma", role: "Siswa SMA, Bandung", avatar: "RK", quote: "Personality identity-ku 'Creative Strategist' dan penjelasannya akurat banget. Langsung aku share ke temen-temen." },
  { name: "Sari Wulandari", role: "Kelas 12, Yogyakarta", avatar: "SW", quote: "Aku yang tadinya ragu, sekarang lebih yakin sama pilihan jurusanku. Warning area-nya juga ngebantu." },
];

const TESTIMONIALS_ROW2 = [
  { name: "Nabila", role: "Kelas 10", avatar: "NB", quote: "Flow-nya seru. Jawab pertanyaan, terus muncul hasil yang detail soal kepribadian dan jurusan." },
  { name: "Fajar", role: "Siswa SMA", avatar: "FJ", quote: "Cocok buat aku yang masih galau mau lanjut kemana. Jadi punya gambaran yang jelas." },
  { name: "Dimas Prasetyo", role: "Kelas 12, Semarang", avatar: "DP", quote: "Yang bikin beda: hasilnya personal, bukan jawaban template. Future lifestyle-nya menarik banget." },
  { name: "Andi", role: "Fresh Graduate SMA", avatar: "AN", quote: "Baru lulus dan bingung mau kuliah jurusan apa. JuruScope kasih arah yang masuk akal buatku." },
  { name: "Maya", role: "Kelas 11", avatar: "MY", quote: "Akhirnya ngerti kenapa aku punya cara berpikir kayak gini. Skill roadmap-nya juga aku simpan." },
];

export function TestimonialMarquee() {
  return (
    <section className="py-24 sm:py-32 bg-white overflow-hidden">
      <Container className="mb-14">
        <motion.div
          className="text-center max-w-2xl mx-auto"
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
      </Container>

      {/* Marquee rows */}
      <div className="space-y-5 relative">
        {/* Gradient masks */}
        <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Row 1 — left */}
        <div className="flex gap-5 animate-marquee-left hover:[animation-play-state:paused]">
          {[...TESTIMONIALS_ROW1, ...TESTIMONIALS_ROW1].map((t, i) => (
            <TestimonialCard key={`r1-${i}`} {...t} />
          ))}
        </div>

        {/* Row 2 — right */}
        <div className="flex gap-5 animate-marquee-right hover:[animation-play-state:paused]">
          {[...TESTIMONIALS_ROW2, ...TESTIMONIALS_ROW2].map((t, i) => (
            <TestimonialCard key={`r2-${i}`} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ name, role, avatar, quote }: { name: string; role: string; avatar: string; quote: string }) {
  return (
    <div className="w-[320px] sm:w-[360px] shrink-0 rounded-xl border-2 border-[#DDD9BD] border-l-4 border-l-[#C9A24E] bg-white p-5">
      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, j) => (
          <Star key={j} className="w-3.5 h-3.5 fill-[#B58E3C] text-[#B58E3C]" />
        ))}
      </div>
      <p className="text-sm text-[#3F4A2E] leading-relaxed mb-4">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-3 border-t border-[#DDD9BD]">
        <div className="w-9 h-9 rounded-lg bg-[#E6E8D2] border border-[#CDD2A8] flex items-center justify-center text-xs font-bold text-[#4B5320]">
          {avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2A311A]">{name}</p>
          <p className="text-[11px] text-[#8A8A72]">{role}</p>
        </div>
      </div>
    </div>
  );
}
