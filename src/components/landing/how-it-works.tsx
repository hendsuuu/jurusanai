"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { ClipboardList, Sparkles, LayoutGrid, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { icon: ClipboardList, title: "Isi Data & Mulai Quiz", desc: "Masukkan nama, email, dan kelas, lalu jawab 50 pertanyaan ringan berbasis perilaku.", highlight: false },
  { icon: Sparkles, title: "AI Menganalisis Dirimu", desc: "Sistem memetakan kepribadian, gaya berpikir, dan minat alami kamu.", highlight: true },
  { icon: LayoutGrid, title: "Lihat Hasil Gratis", desc: "Dapatkan personality identity dan top jurusan yang paling cocok denganmu.", highlight: false },
  { icon: FileText, title: "Buka Full Report", desc: "Unlock laporan lengkap: arah karir, lifestyle, warning area, dan skill roadmap.", highlight: false },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-white">
      <Container>
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4 }}
        >
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#4B5320] uppercase tracking-wider mb-4">
            <span className="w-6 h-0.5 bg-[#C9A24E]" />
            Cara Kerja
            <span className="w-6 h-0.5 bg-[#C9A24E]" />
          </span>
          <h2 className="text-3xl sm:text-[44px] font-extrabold tracking-tight text-[#2A311A] leading-tight">
            Prosesnya ringan, hasilnya bikin kamu lebih kenal diri sendiri.
          </h2>
          <p className="mt-4 text-[#57604A] text-lg leading-relaxed">
            Tidak terasa seperti tes formal. Kamu cukup jawab pertanyaan yang relatable, lalu AI bantu memetakan arah yang paling cocok buatmu.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
            >
              <div
                className={cn(
                  "rounded-2xl p-6 h-full relative overflow-hidden transition-all duration-300 group border-2",
                  step.highlight
                    ? "bg-[#4B5320] text-white border-[#4B5320] shadow-[0_12px_28px_rgba(75,83,32,0.22)] hover:-translate-y-1"
                    : "bg-white border-[#DDD9BD] hover:border-[#4B5320] hover:-translate-y-1"
                )}
              >
                {/* Number badge — squared tile */}
                <div className="flex items-center gap-2 mb-5">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-base font-extrabold",
                      step.highlight
                        ? "bg-[#C9A24E] text-[#2A311A]"
                        : "bg-[#2A311A] text-[#F4EFDE]"
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div
                    className={cn(
                      "flex-1 h-px",
                      step.highlight ? "bg-white/20" : "bg-[#DDD9BD]"
                    )}
                  />
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    "w-11 h-11 rounded-lg flex items-center justify-center mb-4",
                    step.highlight ? "bg-white/15" : "bg-[#E6E8D2]"
                  )}
                >
                  <step.icon
                    className={cn(
                      "w-5 h-5",
                      step.highlight ? "text-[#E4D9A8]" : "text-[#4B5320]"
                    )}
                  />
                </div>

                {/* Content */}
                <h3
                  className={cn(
                    "text-[17px] font-bold mb-2",
                    step.highlight ? "text-white" : "text-[#2A311A]"
                  )}
                >
                  {step.title}
                </h3>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    step.highlight ? "text-white/78" : "text-[#57604A]"
                  )}
                >
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
