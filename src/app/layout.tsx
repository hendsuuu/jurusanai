import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "JuruScope — Kenali dirimu sebelum menentukan masa depan",
    template: "%s · JuruScope",
  },
  description:
    "Platform AI self discovery untuk Gen Z. Jawab 50 pertanyaan ringan dan temukan kepribadian, jurusan, serta arah masa depan yang paling cocok buatmu.",
  manifest: "/manifest.json",
  openGraph: {
    title: "JuruScope — Kenali dirimu sebelum menentukan masa depan",
    description:
      "Platform AI self discovery yang membantu Gen Z memahami potensi diri, kepribadian, dan jurusan yang paling cocok.",
    type: "website",
    locale: "id_ID",
    siteName: "JuruScope",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JuruScope — AI Self Discovery untuk Gen Z",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JuruScope — Kenali dirimu sebelum menentukan masa depan",
    description:
      "Temukan kepribadian, jurusan, dan arah masa depan yang paling cocok lewat AI self discovery.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("h-full", plusJakarta.variable, "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
