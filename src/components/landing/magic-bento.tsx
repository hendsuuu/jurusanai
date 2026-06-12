"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

import {
  Sparkles,
  Brain,
  Compass,
  FileText,
  Heart,
  ShieldCheck,
  Share2,
} from "lucide-react";

const BENTO_CARDS = [
  {
    icon: Sparkles,
    title: "Hasil yang terasa relate banget sama kamu",
    desc: "JuruScope membaca pola jawabanmu untuk menghasilkan personality identity yang personal, bukan label generik yang sama untuk semua orang.",
    large: true,
    blue: true,
  },
  {
    icon: Brain,
    title: "Memahami pola berpikir alamimu",
    desc: "Tahu apakah kamu cenderung kreatif, analitis, atau eksploratif — dan bagaimana itu memengaruhi jurusan yang cocok.",
    large: false,
    blue: false,
  },
  {
    icon: Compass,
    title: "Arah jurusan yang lebih jelas",
    desc: "Lihat jurusan yang paling cocok lengkap dengan persentase kecocokan dan alasan kenapa itu pas buat kamu.",
    large: false,
    blue: false,
  },
  {
    icon: Heart,
    title: "Lifestyle & gaya kerja ideal",
    desc: "Bukan cuma jurusan, kamu juga dapat gambaran lingkungan kerja dan lifestyle yang paling cocok dengan dirimu.",
    large: false,
    blue: false,
  },
  {
    icon: FileText,
    title: "Report rapi dalam bentuk PDF",
    desc: "Hasil disusun ke dalam PDF aesthetic yang enak dibaca, bisa disimpan, dipelajari ulang, atau dibagikan.",
    large: false,
    blue: false,
  },
  {
    icon: ShieldCheck,
    title: "Bukan psikotes yang bikin tegang",
    desc: "Pertanyaannya ringan, situasional, dan relatable. Kamu menjawab sambil santai, bukan seperti sedang diuji.",
    large: true,
    blue: false,
  },
  {
    icon: Share2,
    title: "Hasil yang seru dibagikan",
    desc: "Personality identity kamu dikemas dalam result card aesthetic yang asik di-share ke teman atau story.",
    large: false,
    blue: false,
  },
];

export function MagicBento() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <Container>
        <motion.div
          className="text-center max-w-2xl mx-auto mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4 }}
        >
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#4B5320] uppercase tracking-wider mb-4">
            <span className="w-6 h-0.5 bg-[#C9A24E]" />
            Kenapa JuruScope?
            <span className="w-6 h-0.5 bg-[#C9A24E]" />
          </span>
          <h2 className="text-3xl sm:text-[44px] font-extrabold tracking-tight text-[#2A311A] leading-tight">
            Bukan sekadar tes, tapi cara mengenal dirimu sebelum memilih masa depan
          </h2>
          <p className="mt-4 text-[#57604A] text-lg leading-relaxed">
            Cocok untuk kamu yang masih bingung mau ambil jurusan apa, penasaran sama potensi diri, dan ingin yakin sebelum menentukan arah.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENTO_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className={cn(card.large && "sm:col-span-2 lg:col-span-2")}
            >
              <div
                className={cn(
                  "rounded-2xl p-6 sm:p-7 h-full transition-all duration-300 group relative overflow-hidden border-2",
                  card.blue
                    ? "bg-[#4B5320] text-white border-[#4B5320] shadow-[0_12px_28px_rgba(75,83,32,0.22)] hover:-translate-y-1"
                    : "bg-white border-[#DDD9BD] hover:border-[#4B5320] hover:-translate-y-1"
                )}
              >
                {/* Spotlight glow on hover */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                    card.blue
                      ? "bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_60%)]"
                      : "bg-[radial-gradient(circle_at_50%_0%,rgba(75,83,32,0.06),transparent_60%)]"
                  )}
                />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-lg flex items-center justify-center shrink-0",
                        card.blue ? "bg-[#C9A24E]" : "bg-[#E6E8D2]"
                      )}
                    >
                      <card.icon
                        className={cn(
                          "w-5 h-5",
                          card.blue ? "text-[#2A311A]" : "text-[#4B5320]"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-bold tabular-nums",
                        card.blue ? "text-white/40" : "text-[#C9B96E]"
                      )}
                    >
                      0{i + 1}
                    </span>
                  </div>
                  <h3
                    className={cn(
                      "text-lg sm:text-xl font-bold mb-2",
                      card.blue ? "text-white" : "text-[#2A311A]"
                    )}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={cn(
                      "text-sm sm:text-[15px] leading-relaxed",
                      card.blue ? "text-white/78" : "text-[#57604A]"
                    )}
                  >
                    {card.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
