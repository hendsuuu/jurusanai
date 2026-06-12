import { PublicNav, PublicFooter } from "@/components/layout/public-nav";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ExampleOutput } from "@/components/landing/example-output";
import { MagicBento } from "@/components/landing/magic-bento";
import { PricingTeaser } from "@/components/landing/pricing-teaser";
import { TestimonialMarquee } from "@/components/landing/testimonial-marquee";
import { Faq } from "@/components/landing/faq";
import { CtaSection } from "@/components/landing/cta-section";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "JuruScope",
  applicationCategory: "EducationApplication",
  operatingSystem: "Web",
  description:
    "Platform AI self discovery yang membantu Gen Z memahami potensi diri, kepribadian, dan jurusan yang paling cocok melalui quiz interaktif.",
  url: "https://juruscope.id",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "IDR",
      description: "Personality identity + top 3 jurusan secara gratis",
    },
    {
      "@type": "Offer",
      name: "Expert Deep Report",
      price: "99000",
      priceCurrency: "IDR",
      description: "Full report: personality breakdown, top 5 jurusan, career direction, lifestyle, skill roadmap, dan self development advice",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "214",
    bestRating: "5",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Apa itu JuruScope?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JuruScope adalah platform AI self discovery yang membantu siswa memahami kepribadian, pola berpikir, minat, dan jurusan yang paling cocok melalui quiz interaktif yang ringan dan relatable.",
      },
    },
    {
      "@type": "Question",
      name: "Apakah JuruScope sebuah psikotes formal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bukan. JuruScope bukan psikotes formal, melainkan pengalaman mengenal diri sendiri sebelum menentukan arah masa depan. Hasilnya adalah panduan, bukan keputusan mutlak.",
      },
    },
    {
      "@type": "Question",
      name: "Apa bedanya hasil gratis dan laporan berbayar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Hasil gratis menampilkan personality identity dan top 3 jurusan. Laporan berbayar menambahkan breakdown kepribadian, top 5 jurusan, arah karir, warning area, future lifestyle, dan skill roadmap dalam bentuk PDF.",
      },
    },
    {
      "@type": "Question",
      name: "Apakah data saya aman?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Data digunakan untuk memproses hasil analisis dan mengirim laporan ke email kamu. Hindari memasukkan data sensitif yang tidak diperlukan.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <PublicNav />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <ExampleOutput />
        <MagicBento />
        <PricingTeaser />
        <TestimonialMarquee />
        <Faq />
        <CtaSection />
      </main>
      <PublicFooter />
    </div>
  );
}
