"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import { ChevronDown, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const SUPPORT_EMAIL = "support@juruscope.id";

const FAQ_ITEMS = [
  {
    question: "Apa itu JuruScope?",
    answer:
      "JuruScope adalah platform AI self discovery yang membantu kamu memahami kepribadian, pola berpikir, minat, dan jurusan yang paling cocok melalui quiz interaktif yang ringan dan relatable.",
  },
  {
    question: "Apakah JuruScope sama dengan psikotes formal?",
    answer:
      "Bukan. JuruScope bukan psikotes formal. Ini adalah pengalaman mengenal diri sendiri sebelum menentukan masa depan, dengan pertanyaan berbasis perilaku yang santai dan tidak menegangkan.",
  },
  {
    question: "Apa yang aku dapat secara gratis?",
    answer:
      "Setelah menjawab 50 pertanyaan, kamu langsung mendapat personality identity, top 3 jurusan yang cocok, ringkasan kepribadian singkat, dan arah awal masa depanmu — semuanya gratis.",
  },
  {
    question: "Apa bedanya hasil gratis dan laporan berbayar?",
    answer:
      "Laporan berbayar menambahkan breakdown kepribadian lengkap, top 5 jurusan beserta alasan, arah karir, warning area, future lifestyle, dan skill roadmap dalam bentuk PDF yang aesthetic.",
  },
  {
    question: "Bagaimana jika pembayaran berhasil tetapi PDF gagal dibuat?",
    answer:
      "Kamu bisa menghubungi support melalui email dengan menyertakan email akun, waktu transaksi, dan bukti pembayaran. Tim kami akan membantu pengecekan dan membuat ulang report jika diperlukan.",
  },
  {
    question: "Seberapa akurat hasil analisisnya?",
    answer:
      "Hasil JuruScope adalah panduan untuk mengenal diri, bukan keputusan mutlak. Akurasinya bergantung pada kejujuran kamu saat menjawab. Gunakan hasilnya sebagai bahan refleksi dan diskusi.",
  },
  {
    question: "Apakah aku bisa mengulang quiz?",
    answer:
      "Bisa. Kamu dapat mengisi ulang quiz kapan saja jika ingin melihat hasil dengan jawaban yang berbeda atau setelah kamu merasa lebih mengenal dirimu.",
  },
  {
    question: "Apakah hasilnya bisa dibagikan?",
    answer:
      "Bisa. Personality identity kamu dikemas dalam result card yang aesthetic, cocok untuk dibagikan ke teman atau diunggah ke story.",
  },
  {
    question: "Apakah data saya aman?",
    answer:
      "Data digunakan untuk memproses hasil analisis dan mengirim report ke email kamu. Hindari memasukkan data sensitif yang tidak diperlukan.",
  },
  {
    question: "Bagaimana cara menghubungi support?",
    answer:
      "Kamu dapat menghubungi support melalui email support@juruscope.id untuk kendala pembayaran, report, akun, atau pertanyaan lain.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <section id="faq" className="py-24 sm:py-32 bg-[#F0EEDD]">
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
            FAQ
            <span className="w-6 h-0.5 bg-[#C9A24E]" />
          </span>
          <h2 className="text-3xl sm:text-[44px] font-extrabold tracking-tight text-[#2A311A] leading-tight">
            Pertanyaan yang sering ditanyakan.
          </h2>
          <p className="mt-4 text-[#57604A] text-lg leading-relaxed">
            Beberapa hal penting sebelum kamu mulai mengenal dirimu di JuruScope.
          </p>
        </motion.div>

        {/* Accordion */}
        <div className="max-w-[860px] mx-auto space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
              >
                <div
                  className={cn(
                    "rounded-xl border-2 overflow-hidden transition-all duration-200 bg-white border-l-4",
                    isOpen
                      ? "border-[#CDD2A8] border-l-[#C9A24E]"
                      : "border-[#DDD9BD] border-l-[#DDD9BD] hover:border-l-[#C9A24E]"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-start justify-between gap-3 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4B5320]"
                  >
                    <span
                      className={cn(
                        "font-semibold text-sm sm:text-[15px] leading-snug",
                        isOpen ? "text-[#4B5320]" : "text-[#2A311A]"
                      )}
                    >
                      {item.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 shrink-0 transition-transform duration-200 mt-0.5",
                        isOpen ? "rotate-180 text-[#4B5320]" : "text-[#8A8A72]"
                      )}
                      aria-hidden
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-200 ease-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm text-[#57604A] leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Support CTA */}
          <div className="rounded-xl border-2 border-[#CDD2A8] bg-white p-5 mt-6 border-l-4 border-l-[#C9A24E]">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#E6E8D2] shrink-0">
                <Mail className="w-4 h-4 text-[#4B5320]" />
              </div>
              <div>
                <p className="font-semibold text-[#2A311A] text-sm">
                  Masih butuh bantuan?
                </p>
                <p className="mt-1 text-sm text-[#57604A] leading-relaxed">
                  Hubungi tim support kami untuk kendala pembayaran, PDF, atau pertanyaan lain.
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Bantuan%20JuruScope`}
                  className="mt-3 inline-flex items-center gap-2 h-10 rounded-xl px-5 text-sm font-bold bg-[#4B5320] text-white hover:bg-[#3A4327] transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Hubungi Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
