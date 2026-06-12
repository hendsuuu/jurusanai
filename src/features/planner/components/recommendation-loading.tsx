"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Sparkles } from "lucide-react";

const QUOTES = [
  "Mohon tunggu, kami sedang menganalisis jawaban kamu…",
  "AI sedang memetakan kepribadian dan pola pikirmu…",
  "Mencocokkan karaktermu dengan jurusan yang relate…",
  "Menyusun personality identity yang personal buat kamu…",
  "Hampir selesai, sedang merapikan hasilmu…",
  "Memastikan hasilnya terasa 'ini gue banget'…",
];

export function RecommendationLoading() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="min-h-[100svh] flex items-center justify-center relative"
      style={{
        background:
          "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.15), transparent 50%), linear-gradient(135deg, #4B5320 0%, #3A4327 100%)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <Container variant="narrow" className="relative py-16 sm:py-24">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Animated icon */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white/14 border border-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-[#C9A24E] animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C9A24E] animate-ping opacity-60" />
          </div>

          {/* Skeleton cards */}
          <div className="w-full max-w-lg space-y-3">
            <div className="h-28 w-full rounded-2xl bg-white/10 border border-white/15 animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 rounded-2xl bg-white/8 border border-white/12 animate-pulse" />
              <div className="h-20 rounded-2xl bg-white/8 border border-white/12 animate-pulse" />
            </div>
            <div className="h-28 w-full rounded-2xl bg-white/10 border border-white/15 animate-pulse" />
          </div>

          {/* Rotating quote */}
          <div className="h-12 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="text-sm text-white/75 max-w-md"
              >
                {QUOTES[quoteIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[#C9A24E] animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </Container>
    </motion.div>
  );
}
