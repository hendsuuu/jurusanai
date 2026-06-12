import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { FREE_PLAN, PACKAGES } from "@/lib/constants";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type DisplayPlan = {
  name: string;
  price: number;
  tagline: string;
  description: string;
  features: readonly string[] | string[];
  cta: string;
  recommended?: boolean;
  badge?: string;
};

const ALL_PLANS: DisplayPlan[] = [
  {
    name: FREE_PLAN.name,
    price: FREE_PLAN.price,
    tagline: FREE_PLAN.tagline,
    description: FREE_PLAN.description,
    features: FREE_PLAN.features,
    cta: FREE_PLAN.cta,
  },
  ...PACKAGES.map((p) => ({
    name: p.name,
    price: p.price,
    tagline: p.tagline,
    description: p.description,
    features: p.features,
    cta: p.cta,
    recommended: p.recommended,
    badge: p.badge,
  })),
];

export function PricingTeaser() {
  return (
    <section id="pricing" className="py-24 sm:py-32 bg-[#F6F4E9]">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#4B5320] uppercase tracking-wider mb-4">
            <span className="w-6 h-0.5 bg-[#C9A24E]" />
            Harga
            <span className="w-6 h-0.5 bg-[#C9A24E]" />
          </span>
          <h2 className="text-3xl sm:text-[44px] font-extrabold tracking-tight text-[#2A311A] leading-tight">
            Pilih paket sesuai seberapa dalam kamu ingin mengenal diri.
          </h2>
          <p className="mt-4 text-[#57604A] text-lg leading-relaxed">
            Mulai dari hasil gratis, lalu upgrade saat kamu penasaran dengan analisis lengkap tentang dirimu.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 max-w-3xl mx-auto items-start">
          {ALL_PLANS.map((p) => (
            <div
              key={p.name}
              className={cn(
                "rounded-2xl flex flex-col gap-5 relative transition-all duration-300 overflow-hidden border-2",
                p.recommended
                  ? "bg-[#4B5320] text-white border-[#4B5320] shadow-[0_16px_36px_rgba(75,83,32,0.28)] md:-translate-y-2 hover:-translate-y-3"
                  : "bg-white border-[#DDD9BD] hover:border-[#4B5320] hover:-translate-y-1"
              )}
            >
              {/* Top accent bar */}
              <div className={cn("h-1.5 w-full", p.recommended ? "bg-[#C9A24E]" : "bg-[#E6E8D2]")} />

              <div className="px-6 sm:px-7 pb-6 sm:pb-7 flex flex-col gap-5 flex-1">
                {p.badge ? (
                  <div className="absolute top-4 right-4">
                    <Badge
                      className={cn(
                        p.recommended
                          ? "!bg-[#C9A24E] !text-[#2A311A] !border-transparent"
                          : ""
                      )}
                      variant="brand"
                    >
                      {p.badge}
                    </Badge>
                  </div>
                ) : null}

                <div>
                  <h3
                    className={cn(
                      "text-lg font-bold",
                      p.recommended ? "text-white" : "text-[#2A311A]"
                    )}
                  >
                    {p.name}
                  </h3>
                  <p
                    className={cn(
                      "text-sm mt-1",
                      p.recommended ? "text-white/70" : "text-[#57604A]"
                    )}
                  >
                    {p.tagline}
                  </p>
                </div>

                <div>
                  <div
                    className={cn(
                      "text-3xl sm:text-4xl font-extrabold tracking-tight",
                      p.recommended ? "text-white" : "text-[#2A311A]"
                    )}
                  >
                    {p.price === 0 ? "Rp0" : formatCurrency(p.price)}
                    {p.price > 0 ? (
                      <span
                        className={cn(
                          "text-sm font-medium ml-1",
                          p.recommended ? "text-white/60" : "text-[#8A8A72]"
                        )}
                      >
                        / report
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={cn(
                      "text-xs mt-2",
                      p.recommended ? "text-white/65" : "text-[#57604A]"
                    )}
                  >
                    {p.description}
                  </p>
                </div>

                <ul className="space-y-2.5 text-sm flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span
                        className={cn(
                          "flex items-center justify-center w-4 h-4 rounded-[5px] mt-0.5 shrink-0",
                          p.recommended ? "bg-[#C9A24E]" : "bg-[#E6E8D2]"
                        )}
                      >
                        <Check
                          className={cn(
                            "w-3 h-3",
                            p.recommended ? "text-[#2A311A]" : "text-[#4B5320]"
                          )}
                          aria-hidden
                        />
                      </span>
                      <span
                        className={cn(
                          p.recommended ? "text-white/90" : "text-[#3F4A2E]"
                        )}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/planner"
                  className={cn(
                    "text-center inline-flex items-center justify-center gap-2 h-12 rounded-xl px-5 text-sm font-bold transition-all duration-150",
                    p.recommended
                      ? "bg-[#C9A24E] text-[#2A311A] hover:bg-[#B58E3C] shadow-[0_8px_0_-2px_#8c6f2f] hover:translate-y-0.5 hover:shadow-[0_5px_0_-2px_#8c6f2f]"
                      : "bg-[#4B5320] text-white hover:bg-[#3A4327]"
                  )}
                >
                  {p.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
