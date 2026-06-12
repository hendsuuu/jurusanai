"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Shield, RefreshCw, Calendar, Mail } from "lucide-react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { LEGAL_DOCS, LEGAL_TABS, type LegalDocument } from "./data";

const ICONS = {
  terms: FileText,
  privacy: Shield,
  refund: RefreshCw,
} as const;

type Slug = "terms" | "privacy" | "refund";

export function LegalView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialSlug: Slug =
    tabParam === "privacy" || tabParam === "refund" ? tabParam : "terms";

  const [activeSlug, setActiveSlug] = useState<Slug>(initialSlug);
  const activeDoc = LEGAL_DOCS[activeSlug];

  // Sync URL when tab changes (without scroll jump)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", activeSlug);
    router.replace(`/legal?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug]);

  function handleTabClick(slug: Slug) {
    setActiveSlug(slug);
    // Scroll to top of content area
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <section
      className="relative min-h-screen text-white"
      style={{
        background:
          "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.10), transparent 35%), linear-gradient(135deg, #4B5320 0%, #3A4327 100%)",
      }}
    >
      {/* Background pattern */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <Container className="relative pt-28 pb-20 sm:pt-32 sm:pb-24">
        {/* Header */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          <p className="text-sm font-semibold text-[#C9A24E] uppercase tracking-wider mb-3">
            Legal & Kebijakan
          </p>
          <h1 className="text-3xl sm:text-[44px] font-extrabold tracking-tight leading-[1.08]">
            Hal-hal penting yang perlu kamu tahu.
          </h1>
          <p className="mt-4 text-white/78 text-base sm:text-lg leading-relaxed">
            Kami percaya transparansi itu penting. Baca dengan teliti syarat,
            kebijakan privasi, dan ketentuan refund sebelum menggunakan layanan.
          </p>
        </div>

        {/* Mobile tabs */}
        <div className="lg:hidden mb-6 sticky top-20 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-gradient-to-b from-[#3A4327]/95 to-[#3A4327]/85 backdrop-blur-md">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {LEGAL_TABS.map((tab) => {
              const Icon = ICONS[tab.slug];
              const active = activeSlug === tab.slug;
              return (
                <button
                  key={tab.slug}
                  type="button"
                  onClick={() => handleTabClick(tab.slug)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold transition-all",
                    active
                      ? "bg-white text-[#4B5320] shadow-[0_8px_20px_rgba(15,23,42,0.16)]"
                      : "bg-white/10 text-white/85 border border-white/15 hover:bg-white/16"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Layout: sidebar + content */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 items-start">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block sticky top-28">
            <div className="rounded-3xl bg-white/8 backdrop-blur-md border border-white/15 p-3">
              <p className="px-3 pt-2 pb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
                Pilih Topik
              </p>
              <nav className="space-y-1">
                {LEGAL_TABS.map((tab) => {
                  const Icon = ICONS[tab.slug];
                  const active = activeSlug === tab.slug;
                  return (
                    <button
                      key={tab.slug}
                      type="button"
                      onClick={() => handleTabClick(tab.slug)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all text-left",
                        active
                          ? "bg-white text-[#4B5320] shadow-[0_8px_20px_rgba(15,23,42,0.18)]"
                          : "text-white/82 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Support contact card */}
            <div className="mt-4 rounded-3xl bg-white/8 backdrop-blur-md border border-white/15 p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#C9A24E]/20 border border-[#C9A24E]/30 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#C9A24E]" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Butuh bantuan?</p>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Tim support siap menjawab pertanyaan kamu.
                  </p>
                  <a
                    href="mailto:support@juruscope.id"
                    className="text-xs text-[#C9A24E] font-semibold hover:underline mt-2 inline-block"
                  >
                    support@juruscope.id
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="rounded-3xl bg-white/8 backdrop-blur-md border border-white/15 p-6 sm:p-8 lg:p-10 shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
              >
                <DocContent doc={activeDoc} />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </Container>
    </section>
  );
}

function DocContent({ doc }: { doc: LegalDocument }) {
  return (
    <article className="space-y-8">
      {/* Doc header */}
      <header className="pb-6 border-b border-white/15">
        <h2 className="text-2xl sm:text-[32px] font-extrabold tracking-tight leading-tight">
          {doc.title}
        </h2>
        <p className="mt-2.5 text-white/75 text-sm sm:text-base leading-relaxed">
          {doc.description}
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-white/55">
          <Calendar className="w-3.5 h-3.5" />
          Terakhir diperbarui: {doc.lastUpdated}
        </div>
      </header>

      {/* Sections */}
      <div className="space-y-8">
        {doc.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-32"
          >
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 leading-snug">
              {section.title}
            </h3>
            <div className="space-y-2.5">
              {section.body.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-[15px] sm:text-base text-white/82 leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Footer note */}
      <footer className="pt-6 mt-8 border-t border-white/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-white/55">
          © {new Date().getFullYear()} JuruScope. All rights reserved.
        </p>
        <a
          href="mailto:support@juruscope.id"
          className="inline-flex items-center gap-1.5 text-xs text-[#C9A24E] font-semibold hover:underline"
        >
          <Mail className="w-3 h-3" />
          Hubungi Support
        </a>
      </footer>
    </article>
  );
}
