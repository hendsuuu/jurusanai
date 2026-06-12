"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { CheckCircle2, FileText, TrendingUp, Shield, BarChart3, ArrowRight } from "lucide-react";
import CardSwap, { Card } from "@/components/CardSwap";

const HIGHLIGHTS = [
  { icon: FileText, text: "Personality overview dan identity kamu" },
  { icon: TrendingUp, text: "Top jurusan match beserta persentase kecocokan" },
  { icon: BarChart3, text: "Arah karir dan gaya kerja yang cocok" },
  { icon: Shield, text: "Warning area & future lifestyle compatibility" },
  { icon: CheckCircle2, text: "Skill roadmap dan self development advice" },
];

export function ExampleOutput() {
  return (
    <section id="example" className="py-24 sm:py-32 bg-[#F0EEDD]">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 text-sm font-bold text-[#4B5320] uppercase tracking-wider mb-4">
              <span className="w-6 h-0.5 bg-[#C9A24E]" />
              Output
            </span>
            <h2 className="text-3xl sm:text-[40px] font-extrabold tracking-tight text-[#2A311A] leading-tight">
              Hasil akhirnya berupa PDF self discovery report yang aesthetic.
            </h2>
            <p className="mt-4 text-[#57604A] text-lg leading-relaxed">
              Setiap report disusun agar personal, mudah dipahami, dan membantu kamu memahami kepribadian, jurusan, arah karir, hingga rencana pengembangan diri.
            </p>

            <div className="mt-8 space-y-3">
              {HIGHLIGHTS.map((h, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-[#DDD9BD] bg-white px-3.5 py-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E6E8D2] flex items-center justify-center shrink-0">
                    <h.icon className="w-4 h-4 text-[#4B5320]" />
                  </div>
                  <p className="text-[15px] text-[#3F4A2E] leading-relaxed pt-1">{h.text}</p>
                </div>
              ))}
            </div>

            <a
              href="/api/sample-pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-8 h-12 px-6 rounded-xl bg-[#2A311A] text-white text-sm font-bold hover:bg-[#1C2114] transition-colors"
            >
              Lihat Contoh PDF
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
          {/* Right — CardSwap with screenshots */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45 }}
            className="relative flex items-center justify-center min-h-[420px] sm:min-h-[500px] lg:min-h-[520px] overflow-visible"
          >
            {/* 
              CardSwap uses absolute positioning internally (bottom-0 right-0).
              We counteract this by placing a sized box in the center and letting
              the CardSwap overflow from it in a visually centered way.
            */}
            <div className="relative w-[280px] h-[360px] sm:w-[320px] sm:h-[420px] lg:w-[340px] lg:h-[440px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full perspective-[900px]">
                  <CardSwap
                    width="100%"
                    height="100%"
                    cardDistance={35}
                    verticalDistance={40}
                    delay={4000}
                    pauseOnHover
                    easing="elastic"
                    skewAmount={4}
                  >
                    <Card customClass="!bg-white !border-[#CDD2A8] shadow-[0_24px_64px_rgba(75,83,32,0.12)] overflow-hidden">
                      <Image
                        src="/screenshot-1.png"
                        alt="Contoh output PDF JuruScope halaman 1"
                        width={340}
                        height={440}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </Card>
                    <Card customClass="!bg-white !border-[#CDD2A8] shadow-[0_24px_64px_rgba(75,83,32,0.12)] overflow-hidden">
                      <Image
                        src="/screenshot-2.png"
                        alt="Contoh output PDF JuruScope halaman 2"
                        width={340}
                        height={440}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </Card>
                    <Card customClass="!bg-white !border-[#CDD2A8] shadow-[0_24px_64px_rgba(75,83,32,0.12)] overflow-hidden">
                      <Image
                        src="/screenshot-3.png"
                        alt="Contoh output PDF JuruScope halaman 3"
                        width={340}
                        height={440}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </Card>
                  </CardSwap>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
