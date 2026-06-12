import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav, PublicFooter } from "@/components/layout/public-nav";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Compass, Brain } from "lucide-react";

export const metadata: Metadata = {
  title: "Contoh Hasil Self Discovery",
  description:
    "Lihat contoh personality identity dan jurusan yang bisa muncul dari analisis JuruScope.",
};

type ExamplePersonality = {
  title: string;
  tagline: string;
  traits: string[];
  jurusan: Array<{ name: string; match: number }>;
};

const EXAMPLE_PERSONALITIES: ExamplePersonality[] = [
  {
    title: "Creative Strategist",
    tagline: "Mikir pakai ide, gerak pakai rasa penasaran.",
    traits: ["Kreativitas", "Komunikasi", "Eksplorasi"],
    jurusan: [
      { name: "Desain Komunikasi Visual", match: 92 },
      { name: "Ilmu Komunikasi", match: 87 },
      { name: "Marketing / Bisnis Digital", match: 83 },
    ],
  },
  {
    title: "Analytical Creator",
    tagline: "Suka memecah masalah jadi langkah yang masuk akal.",
    traits: ["Logika", "Berpikir Analitis", "Stabilitas"],
    jurusan: [
      { name: "Teknik Informatika", match: 91 },
      { name: "Sistem Informasi", match: 85 },
      { name: "Data Science / Statistika", match: 80 },
    ],
  },
  {
    title: "Visionary Connector",
    tagline: "Hidup dari interaksi dan ide yang menular ke orang lain.",
    traits: ["Komunikasi", "Kecerdasan Sosial", "Kepemimpinan"],
    jurusan: [
      { name: "Ilmu Komunikasi", match: 90 },
      { name: "Psikologi", match: 84 },
      { name: "Manajemen / Marketing", match: 81 },
    ],
  },
  {
    title: "Explorer Builder",
    tagline: "Belajar paling cepat saat mencoba langsung.",
    traits: ["Eksplorasi", "Kreativitas", "Eksekusi"],
    jurusan: [
      { name: "Manajemen Bisnis", match: 86 },
      { name: "Teknik Industri", match: 82 },
      { name: "Kewirausahaan", match: 79 },
    ],
  },
  {
    title: "Empathic Helper",
    tagline: "Peka pada orang dan ingin memberi dampak.",
    traits: ["Kecerdasan Sosial", "Empati", "Komunikasi"],
    jurusan: [
      { name: "Psikologi", match: 90 },
      { name: "Ilmu Kesehatan / Keperawatan", match: 83 },
      { name: "Pendidikan", match: 80 },
    ],
  },
  {
    title: "Logical Architect",
    tagline: "Nyaman membangun sistem yang rapi dan terukur.",
    traits: ["Logika", "Stabilitas", "Berpikir Analitis"],
    jurusan: [
      { name: "Teknik Sipil / Arsitektur", match: 88 },
      { name: "Teknik Elektro", match: 84 },
      { name: "Akuntansi", match: 79 },
    ],
  },
];

export default function ExamplesPage() {
  return (
    <div className="flex flex-col flex-1">
      <PublicNav />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden text-white"
          style={{ background: "linear-gradient(135deg, #4B5320 0%, #2F3A22 100%)" }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
          <div
            aria-hidden
            className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"
            style={{ background: "rgba(201, 162, 78, 0.18)" }}
          />

          <Container className="relative pt-28 pb-14 sm:pt-32 sm:pb-20">
            <div className="max-w-2xl">
              <Badge
                variant="blue"
                className="mb-4 !bg-white/14 !text-white !border-white/20 backdrop-blur-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C9A24E]" />
                Contoh Personality Identity
              </Badge>
              <h1 className="text-3xl sm:text-[44px] lg:text-[52px] font-extrabold tracking-tight text-white leading-[1.08]">
                Contoh hasil yang
                <br />
                <span className="bg-gradient-to-r from-white to-[#EDE6CF] bg-clip-text text-transparent">
                  bisa kamu dapatkan.
                </span>
              </h1>
              <p className="mt-4 sm:mt-5 text-white/80 text-base sm:text-lg leading-relaxed">
                Setiap orang punya personality identity unik. Ini beberapa contoh hasil — punyamu akan terasa lebih
                personal setelah kamu ikut analisis.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/planner"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#C9A24E] text-[#2A311A] text-sm font-bold hover:bg-[#B58E3C] shadow-[0_14px_30px_rgba(201,162,78,0.32)] hover:-translate-y-px transition-all duration-200"
                >
                  Mulai Analisis
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="/api/sample-pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white text-[#4B5320] text-sm font-semibold hover:bg-[#F0EEDD] transition-colors"
                >
                  Lihat Contoh PDF
                </a>
              </div>
            </div>
          </Container>

          <div className="absolute bottom-0 left-0 right-0 h-10 sm:h-14 bg-[#F6F4E9]" style={{ clipPath: "ellipse(75% 100% at 50% 100%)" }} />
        </section>

        {/* Content */}
        <div className="bg-[#F6F4E9]">
          <Container className="py-10 sm:py-14">
            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {EXAMPLE_PERSONALITIES.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl border border-[#DDD9BD] bg-white p-5 hover:border-[#CDD2A8] hover:shadow-[0_12px_32px_rgba(75,83,32,0.08)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#E6E8D2] flex items-center justify-center text-[#4B5320]">
                      <Brain className="w-4 h-4" />
                    </div>
                    <h3 className="text-[15px] font-bold text-[#2A311A] leading-snug">{p.title}</h3>
                  </div>
                  <p className="text-xs text-[#57604A] leading-relaxed mb-3">{p.tagline}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.traits.map((t) => (
                      <span key={t} className="text-[10px] font-semibold text-[#57604A] bg-[#F0EEDD] border border-[#DDD9BD] px-2 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-2 border-t border-[#DDD9BD] pt-3">
                    <p className="text-[10px] uppercase tracking-wider text-[#8A8A72] font-semibold flex items-center gap-1">
                      <Compass className="w-3 h-3" /> Top Jurusan
                    </p>
                    {p.jurusan.map((j) => (
                      <div key={j.name} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-[#2A311A] truncate">{j.name}</span>
                        <span className="text-xs font-bold text-[#4B5320] shrink-0">{j.match}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 sm:mt-12 rounded-3xl border border-[#CDD2A8] bg-white p-6 sm:p-8 text-center shadow-[0_12px_32px_rgba(75,83,32,0.06)]">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#2A311A] tracking-tight">
                Penasaran sama hasilmu sendiri?
              </h3>
              <p className="mt-2 text-sm sm:text-base text-[#57604A] max-w-xl mx-auto">
                Jawab 50 pertanyaan ringan dan temukan personality identity serta jurusan yang paling cocok buatmu.
              </p>
              <Link
                href="/planner"
                className="inline-flex items-center gap-2 mt-5 h-11 px-6 rounded-full bg-[#4B5320] text-white text-sm font-bold hover:bg-[#3A4327] shadow-[0_10px_24px_rgba(75,83,32,0.28)] transition-colors"
              >
                Mulai Analisis
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </Container>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
