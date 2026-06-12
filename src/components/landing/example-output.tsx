"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";
import { CheckCircle2, FileText, TrendingUp, Shield, BarChart3, ArrowRight, ChevronRight } from "lucide-react";

const HIGHLIGHTS = [
  { icon: FileText, text: "Personality overview dan identity kamu" },
  { icon: TrendingUp, text: "Top jurusan match beserta persentase kecocokan" },
  { icon: BarChart3, text: "Arah karir dan gaya kerja yang cocok" },
  { icon: Shield, text: "Warning area & future lifestyle compatibility" },
  { icon: CheckCircle2, text: "Skill roadmap dan self development advice" },
];

const PAGES = [
  { label: "Cover & Identity", page: "01 / 12" },
  { label: "Jurusan Match", page: "04 / 12" },
  { label: "Skill Roadmap", page: "07 / 12" },
];

// ─── Page mocks ─────────────────────────────────────────────────────────────

function PdfHeader({ title }: { title: string }) {
  return (
    <div className="bg-[#2A311A] text-white px-4 py-2.5 flex items-center gap-2 shrink-0">
      <div className="w-4 h-4 rounded bg-[#C9A24E] flex items-center justify-center shrink-0">
        <span className="text-[7px] font-black text-[#2A311A]">J</span>
      </div>
      <span className="text-[10px] font-bold tracking-wider uppercase">{title}</span>
      <span className="ml-auto text-[9px] text-white/40 font-mono">JuruScope</span>
    </div>
  );
}

function PdfFooter({ page }: { page: string }) {
  return (
    <div className="bg-white border-t border-[#E6E3D0] px-4 py-1.5 flex items-center shrink-0">
      <span className="text-[8px] text-[#8A8A72]">Self Discovery Report · AI-Generated</span>
      <span className="ml-auto text-[8px] font-bold text-[#2A311A] font-mono">{page}</span>
    </div>
  );
}

function CoverPage() {
  return (
    <div className="flex flex-col h-full">
      <PdfHeader title="Self Discovery Report" />
      <div className="flex-1 bg-gradient-to-br from-[#F8F6EC] to-[#EDE8D0] p-4 flex flex-col min-h-0 overflow-hidden">
        <div className="text-[9px] text-[#8A8A72] uppercase tracking-widest mb-0.5">Personality Profile</div>
        <h3 className="text-[18px] sm:text-xl font-extrabold text-[#2A311A] leading-tight mb-1">
          Creative Strategist
        </h3>
        <p className="text-[10px] text-[#57604A] leading-relaxed mb-3">
          Pemikir kreatif yang sistematis — memadukan imajinasi dengan eksekusi terencana.
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {["Analitik", "Adaptif", "Visioner", "Komunikatif"].map((tag) => (
            <span key={tag} className="text-[9px] font-semibold bg-[#2A311A] text-white px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-2.5">
          {[
            { label: "Kreativitas", val: 88 },
            { label: "Kepemimpinan", val: 72 },
            { label: "Analisis", val: 81 },
            { label: "Komunikasi", val: 76 },
          ].map((t) => (
            <div key={t.label}>
              <div className="flex justify-between text-[9px] text-[#57604A] mb-0.5">
                <span>{t.label}</span>
                <span className="font-bold text-[#2A311A]">{t.val}%</span>
              </div>
              <div className="h-1.5 bg-[#DDD9BD] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C9A24E] rounded-full"
                  style={{ width: `${t.val}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-3">
          <div className="rounded-lg bg-[#2A311A]/8 border border-[#CDD2A8] p-2.5">
            <p className="text-[9px] text-[#57604A] leading-relaxed italic">
              &ldquo;Kamu bekerja paling baik ketika diberi kebebasan untuk mengeksplorasi, lalu menyusun rencana yang sistematis.&rdquo;
            </p>
          </div>
        </div>
      </div>
      <PdfFooter page="01 / 12" />
    </div>
  );
}

function JurusanPage() {
  const majors = [
    { name: "Desain Komunikasi Visual", pct: 94, note: "Highly recommended" },
    { name: "Ilmu Komunikasi", pct: 87, note: "Strong match" },
    { name: "Teknik Informatika", pct: 79, note: "Good match" },
  ];

  return (
    <div className="flex flex-col h-full">
      <PdfHeader title="Jurusan Match" />
      <div className="flex-1 bg-white p-4 flex flex-col gap-2.5 min-h-0 overflow-hidden">
        <div className="text-[9px] text-[#8A8A72] uppercase tracking-widest">Top Rekomendasi Jurusan</div>

        {majors.map((m, i) => (
          <div
            key={m.name}
            className={`rounded-lg p-2.5 border ${
              i === 0
                ? "border-[#C9A24E] bg-[#FDFAF2]"
                : "border-[#E6E3D0] bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-bold text-[#2A311A] leading-tight">{m.name}</span>
              <span
                className={`text-[11px] font-black shrink-0 ${
                  i === 0 ? "text-[#C9A24E]" : "text-[#4B5320]"
                }`}
              >
                {m.pct}%
              </span>
            </div>
            <div className="h-1.5 bg-[#E6E3D0] rounded-full overflow-hidden mb-1">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${m.pct}%`,
                  backgroundColor: i === 0 ? "#C9A24E" : "#6B7A3E",
                }}
              />
            </div>
            <p className="text-[8px] text-[#8A8A72]">{m.note}</p>
          </div>
        ))}

        <div className="mt-auto pt-2 border-t border-[#E6E3D0]">
          <p className="text-[8px] text-[#8A8A72] leading-relaxed">
            Berdasarkan 42 dimensi kepribadian, minat bakat, dan gaya belajar kamu.
          </p>
        </div>
      </div>
      <PdfFooter page="04 / 12" />
    </div>
  );
}

function CareerPage() {
  return (
    <div className="flex flex-col h-full">
      <PdfHeader title="Skill Roadmap" />
      <div className="flex-1 bg-white p-4 flex flex-col gap-2.5 min-h-0 overflow-hidden">
        <div className="text-[9px] text-[#8A8A72] uppercase tracking-widest">Career Path & Development</div>

        <div className="space-y-2">
          {[
            { emoji: "🎨", title: "Creative Director", timeline: "5–7 tahun", color: "#4B5320" },
            { emoji: "📊", title: "Brand Strategist", timeline: "3–5 tahun", color: "#6B7A3E" },
            { emoji: "💡", title: "UX Researcher", timeline: "2–3 tahun", color: "#8A9A5B" },
          ].map((c) => (
            <div key={c.title} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#E6E3D0] bg-white">
              <span className="text-sm shrink-0">{c.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-[#2A311A] truncate">{c.title}</p>
                <p className="text-[8px] text-[#8A8A72]">Est. {c.timeline}</p>
              </div>
              <ChevronRight className="w-3 h-3 text-[#CDD2A8] shrink-0" />
            </div>
          ))}
        </div>

        <div className="mt-1">
          <p className="text-[9px] font-semibold text-[#57604A] mb-1.5">Skills to Develop</p>
          <div className="flex flex-wrap gap-1">
            {["Visual Design", "Copywriting", "Data Viz", "Public Speaking", "Project Mgmt"].map(
              (s) => (
                <span
                  key={s}
                  className="text-[8px] bg-[#E6E8D2] text-[#4B5320] px-1.5 py-0.5 rounded font-medium"
                >
                  {s}
                </span>
              )
            )}
          </div>
        </div>

        <div className="mt-auto pt-2 border-t border-[#E6E3D0]">
          <p className="text-[8px] text-[#8A8A72]">Roadmap ini disesuaikan berdasarkan profil kepribadian dan jurusan yang kamu pilih.</p>
        </div>
      </div>
      <PdfFooter page="07 / 12" />
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function ExampleOutput() {
  const [activePage, setActivePage] = useState(0);

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
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-[#DDD9BD] bg-white px-3.5 py-3"
                >
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

          {/* Right — PDF Mock Preview */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45 }}
            className="flex flex-col items-center gap-5"
          >
            {/* Floating badge */}
            <div className="self-end mr-2 sm:mr-6 flex items-center gap-1.5 bg-white border border-[#DDD9BD] rounded-full px-3 py-1.5 shadow-sm">
              <span className="text-[10px] font-bold text-[#4B5320]">★ Premium Report</span>
              <span className="w-1 h-1 rounded-full bg-[#CDD2A8]" />
              <span className="text-[10px] text-[#8A8A72]">12 halaman</span>
            </div>

            {/* PDF page card with paper-stack effect */}
            <div className="relative w-[280px] sm:w-[320px]">
              {/* Paper layers behind */}
              <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-xl bg-[#C9A24E]/25 -z-10" />
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-xl bg-[#DDD9BD] border border-[#CDD2A8] -z-10" />

              {/* Main card */}
              <div
                className="relative w-full rounded-xl overflow-hidden border border-[#CDD2A8] shadow-2xl bg-white"
                style={{ aspectRatio: "3 / 4" }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePage}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex flex-col"
                  >
                    {activePage === 0 && <CoverPage />}
                    {activePage === 1 && <JurusanPage />}
                    {activePage === 2 && <CareerPage />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Page selector tabs */}
            <div className="flex gap-2">
              {PAGES.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActivePage(i)}
                  className={`px-3.5 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                    activePage === i
                      ? "bg-[#2A311A] text-white shadow-sm"
                      : "bg-white border border-[#DDD9BD] text-[#57604A] hover:border-[#4B5320] hover:text-[#2A311A]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </motion.div>

        </div>
      </Container>
    </section>
  );
}
