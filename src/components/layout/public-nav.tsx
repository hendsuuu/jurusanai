"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "Cara Kerja" },
  { href: "/#example", label: "Hasil Report" },
  { href: "/#pricing", label: "Harga" },
  { href: "/#faq", label: "FAQ" },
  { href: "/examples", label: "Contoh" },
];

export function PublicNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 z-50 transition-all duration-300",
        scrolled ? "top-3 sm:top-4" : "top-0"
      )}
    >
      <div
        className={cn(
          "mx-auto transition-all duration-300",
          scrolled
            ? "max-w-[1200px] mx-3 sm:mx-auto rounded-2xl border border-[#DDD9BD] bg-white/90 backdrop-blur-xl shadow-[0_12px_32px_rgba(42,49,26,0.12)]"
            : "max-w-7xl bg-transparent"
        )}
      >
        <nav
          className={cn(
            "flex items-center justify-between transition-all duration-300 mx-auto",
            scrolled ? "h-14 sm:h-[60px] px-4 sm:px-6" : "h-[72px] sm:h-20 px-5 sm:px-8"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div
              className={cn(
                "relative rounded-full overflow-hidden ring-2 transition-all duration-300 shrink-0",
                scrolled
                  ? "w-9 h-9 ring-[#4B5320]/15 bg-white"
                  : "w-10 h-10 ring-white/40 bg-white/95"
              )}
            >
              <Image
                src="/logo.png"
                alt="JuruScope"
                width={80}
                height={80}
                priority
                className="w-full h-full object-cover scale-[1.15] transition-transform duration-300 group-hover:scale-[1.22]"
              />
            </div>
            <span
              className={cn(
                "font-bold text-[17px] tracking-tight transition-colors duration-200",
                scrolled ? "text-[#2A311A]" : "text-white"
              )}
            >
              Juru<span className={scrolled ? "text-[#4B5320]" : "text-[#C9A24E]"}>Scope</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-lg text-[14px] font-medium transition-colors duration-200",
                  scrolled
                    ? "text-[#57604A] hover:text-[#4B5320] hover:bg-[#E6E8D2]"
                    : "text-white/86 hover:text-white hover:bg-white/14"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/planner"
              className={cn(
                "hidden sm:inline-flex items-center rounded-lg text-[14px] font-bold transition-all duration-200 h-9 px-4 bg-[#C9A24E] text-[#2A311A] hover:bg-[#B58E3C] shadow-[0_5px_0_-1px_#8c6f2f] hover:translate-y-0.5 hover:shadow-[0_3px_0_-1px_#8c6f2f]"
              )}
            >
              Mulai Analisis
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "md:hidden p-2 rounded-full transition-colors",
                scrolled
                  ? "text-[#2A311A] hover:bg-[#F0EEDD]"
                  : "text-white hover:bg-white/14"
              )}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen ? (
        <div className="md:hidden mx-3 mt-3 rounded-2xl border border-[#DDD9BD] bg-white shadow-[0_12px_32px_rgba(42,49,26,0.16)] p-4">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-[#2A311A] hover:bg-[#E6E8D2] hover:text-[#4B5320] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/planner"
              onClick={() => setMobileOpen(false)}
              className="block mt-3 text-center h-11 leading-[44px] rounded-lg bg-[#C9A24E] text-[#2A311A] text-sm font-bold hover:bg-[#B58E3C] shadow-[0_5px_0_-1px_#8c6f2f]"
            >
              Mulai Analisis
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #4B5320 0%, #3A4327 100%)" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <Container className="relative py-14 sm:py-20">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-10 lg:gap-20">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/30 bg-white/95 shrink-0">
                <Image
                  src="/logo.png"
                  alt="JuruScope"
                  width={88}
                  height={88}
                  className="w-full h-full object-cover scale-[1.15]"
                />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                Juru<span className="text-[#C9A24E]">Scope</span>
              </span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed max-w-xs">
              Membantu Gen Z mengenal dirinya sendiri sebelum menentukan jurusan dan arah masa depan.
            </p>
            <Link
              href="/planner"
              className="inline-flex items-center gap-2 mt-5 h-10 px-5 rounded-lg bg-[#C9A24E] text-[#2A311A] text-sm font-bold hover:bg-[#B58E3C] shadow-[0_5px_0_-1px_#8c6f2f] transition-all"
            >
              Mulai Analisis
            </Link>
          </div>

          {/* Footer menus (3 columns nested) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10">
            {/* Menu */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Menu</h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/#how-it-works", label: "Cara Kerja" },
                  { href: "/#example", label: "Contoh Hasil" },
                  { href: "/#pricing", label: "Harga" },
                  { href: "/#faq", label: "FAQ" },
                  { href: "/examples", label: "Contoh" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-white/75 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/legal?tab=terms"
                    className="text-sm text-white/75 hover:text-white transition-colors"
                  >
                    Syarat & Ketentuan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal?tab=privacy"
                    className="text-sm text-white/75 hover:text-white transition-colors"
                  >
                    Kebijakan Privasi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal?tab=refund"
                    className="text-sm text-white/75 hover:text-white transition-colors"
                  >
                    Kebijakan Refund
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-sm font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="mailto:support@juruscope.id" className="text-sm text-white/75 hover:text-white transition-colors">
                    support@juruscope.id
                  </a>
                </li>
                {/* <li>
                  <a
                    href="https://wa.me/6281234222797?text=Halo%20JuruScope%2C%20saya%20butuh%20bantuan."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/75 hover:text-white transition-colors"
                  >
                    +62 8123 4222 797
                  </a>
                </li> */}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/16 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} JuruScope. All rights reserved.
          </p>
          <p className="text-[11px] text-white/50 text-center sm:text-right max-w-md">
            Disclaimer: Hasil AI adalah panduan self discovery untuk mengenal diri, bukan keputusan mutlak soal jurusan atau masa depan.
          </p>
        </div>
      </Container>
    </footer>
  );
}
