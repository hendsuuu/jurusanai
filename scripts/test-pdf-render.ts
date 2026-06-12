/**
 * Standalone test for PDF template rendering — no AI/API calls required.
 * Generates a real PDF from mock data to verify the new premium template.
 *
 * Run: npx tsx scripts/test-pdf-render.ts
 */

process.env.DATABASE_URL = "postgresql://x:x@localhost:5432/x";
process.env.AUTH_SECRET = "test-secret-32-chars-minimum-ok";
process.env.NODE_ENV = "development";

import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { renderPlanDocument } from "../src/server/pdf/pdf-template";
import type { AiBusinessPlan } from "../src/server/ai/schemas";
import type { FinancialProjection } from "../src/server/business/types";
import type { BusinessPlan } from "@prisma/client";

const mockAi: AiBusinessPlan = {
  cover: {
    title: "Rencana Bisnis Rice Bowl Pre-order",
    business_name: "RiceBowl Express Semarang",
    business_idea: "Rice Bowl Pre-order untuk Mahasiswa",
    location: "Semarang, area kampus Tembalang",
    business_model: "Pre-order via WhatsApp + delivery harian",
    short_summary:
      "Bisnis rice bowl pre-order yang menargetkan mahasiswa kampus Tembalang dengan menu lauk variatif harga Rp15.000-25.000, sistem pre-order H-1 untuk efisiensi modal & meminimalisir food waste.",
  },
  business_snapshot: {
    overview:
      "Rice Bowl Express adalah bisnis kuliner pre-order yang menjual rice bowl dengan 5 varian lauk untuk segmen mahasiswa di area Tembalang. Produksi dilakukan setelah order masuk untuk meminimalisir waste, dengan delivery cluster 2x/hari (siang & malam).",
    key_metrics: [
      { label: "Target Customer Awal", value: "30 customer/hari", note: "Hari kerja Senin-Jumat" },
      { label: "Modal Awal", value: "Rp7,5 juta", note: "Termasuk peralatan dan stok awal" },
      { label: "Margin Kotor Rata-rata", value: "55%", note: "Setelah HPP bahan baku" },
      { label: "Break-even", value: "3-4 bulan", note: "Skenario realistis" },
      { label: "Channel Utama", value: "WhatsApp + Instagram", note: "Organic + komunitas kos" },
      { label: "Operasional", value: "5 hari/minggu", note: "26 hari/bulan" },
    ],
    strategic_summary:
      "Fokus pada kecepatan delivery, konsistensi rasa, dan pricing terjangkau (Rp15-25rb). Diferensiasi via menu rotasi mingguan dan paket hemat untuk repeat order. Skala bertahap dari 30 → 60 → 100 customer/hari dalam 90 hari.",
  },
  problem_opportunity_target_market: {
    problems: [
      "Mahasiswa kampus Tembalang sering bingung cari makan praktis dengan harga di bawah Rp25.000.",
      "Warteg sekitar kampus penuh saat jam makan siang & malam, antrian panjang.",
      "Layanan delivery ojek online membebankan ongkir Rp8-15rb yang membuat total mahal.",
      "Menu kantin kampus monoton dan kualitas tidak konsisten.",
    ],
    opportunities: [
      { factor: "Populasi Mahasiswa Tembalang", explanation: "Lebih dari 25.000 mahasiswa aktif Undip + kost berdekatan, density tinggi memudahkan delivery cluster." },
      { factor: "Tren Pre-order", explanation: "Mahasiswa terbiasa pre-order makanan via WhatsApp/Instagram, terutama untuk paket harga lebih murah." },
      { factor: "Gap Harga di Pasar", explanation: "Sedikit pemain yang menjual rice bowl Rp15-25rb dengan kualitas konsisten dan delivery gratis dalam radius 1km." },
    ],
    target_segments: [
      { segment: "Mahasiswa Kost", need: "Makan praktis 2x/hari dengan budget Rp30-50rb/hari", how_to_reach: "Promo via grup WhatsApp kos, flyer di area kost, kerjasama owner kos" },
      { segment: "Mahasiswa Indekos Aktif Komunitas", need: "Paket grup untuk acara organisasi/UKM", how_to_reach: "Sponsor event UKM, paket hemat 10+ porsi" },
      { segment: "Pekerja Muda Sekitar Kampus", need: "Lunch box harian rapi & cepat", how_to_reach: "Penawaran subscription harian via Instagram Ads dan rekomendasi kantor" },
    ],
    customer_persona: {
      name: "Dimas, mahasiswa S1 semester 4",
      profile: "Tinggal di kost area Banjarsari, uang saku Rp1,5jt/bulan, jadwal kuliah pagi-sore, sering malas keluar saat panas/hujan.",
      main_problem: "Bosan makan warteg yang itu-itu saja, ingin variasi lauk tapi budget terbatas.",
      buying_reason: "Harga di bawah Rp20rb, delivery cepat, menu dirotasi mingguan, dan bisa pesan H-1 untuk hemat.",
    },
  },
  product_strategy: {
    products: [
      { name: "Rice Bowl Ayam Geprek", description: "Nasi + ayam geprek sambal, lalap, kerupuk", selling_price: 18000, estimated_hpp: 8500, gross_profit_per_unit: 9500, gross_margin_percentage: 52.8 },
      { name: "Rice Bowl Ayam Teriyaki", description: "Nasi + ayam teriyaki, telur, sayur", selling_price: 20000, estimated_hpp: 9500, gross_profit_per_unit: 10500, gross_margin_percentage: 52.5 },
      { name: "Rice Bowl Beef Blackpepper", description: "Nasi + daging sapi blackpepper, paprika, bawang", selling_price: 25000, estimated_hpp: 13000, gross_profit_per_unit: 12000, gross_margin_percentage: 48.0 },
      { name: "Rice Bowl Telur Balado", description: "Nasi + telur balado, tahu/tempe, lalap (paket hemat)", selling_price: 15000, estimated_hpp: 6500, gross_profit_per_unit: 8500, gross_margin_percentage: 56.7 },
    ],
    value_proposition: [
      "Harga di bawah Rp25rb dengan kualitas porsi mahasiswa puas (250-300gr).",
      "Pre-order H-1 dapat diskon Rp2rb dan free delivery dalam radius 1km.",
      "Menu dirotasi mingguan agar tidak bosan, ada menu spesial weekend.",
      "Packaging rapi & tahan tumpah untuk delivery motor.",
    ],
    differentiation: [
      { aspect: "Sistem Pre-order", strategy: "Order H-1 sebelum jam 18:00 dapat diskon Rp2rb, sehingga modal bahan tepat sasaran." },
      { aspect: "Menu Rotation", strategy: "Setiap minggu ada 1 menu baru terbatas (limited menu) untuk mendorong repeat order." },
      { aspect: "Komunitas Lokal", strategy: "Partner dengan grup WhatsApp kost & UKM kampus untuk distribusi & promosi gratis." },
      { aspect: "Packaging", strategy: "Box food-grade kraft dengan stiker brand, terlihat premium di kelas Rp15-25rb." },
    ],
    menu_development_plan: [
      { phase: "Bulan 1", focus: "Validasi 4 menu inti dan terima feedback rasa, packaging, ketepatan waktu." },
      { phase: "Bulan 2", focus: "Tambah 2 menu baru berdasarkan feedback dan permintaan komunitas (mis. Rice Bowl Vegetarian)." },
      { phase: "Bulan 3", focus: "Launch paket hemat group order (5 box) dengan diskon untuk acara UKM dan rapat organisasi." },
    ],
  },
  business_model_sales_funnel: {
    revenue_streams: [
      { source: "Penjualan Rice Bowl Reguler", explanation: "Order harian dari individual via WhatsApp, kontribusi ~75% pendapatan." },
      { source: "Paket Group Order", explanation: "Order grup 5+ porsi untuk event organisasi, kontribusi ~20% pendapatan dengan margin lebih tinggi." },
      { source: "Subscription Mingguan", explanation: "Lunch subscription 5 hari kerja untuk pekerja kantor, ~5% pendapatan tapi predictable." },
    ],
    sales_flow: [
      "Customer melihat menu via Instagram story / katalog WhatsApp.",
      "Customer order via WA dengan format yang sudah disiapkan (nama, menu, jumlah, alamat).",
      "Admin konfirmasi order & total bayar, customer transfer / bayar di tempat.",
      "Order diolah pagi/sore, dipacking, dan dikirim sesuai cluster delivery.",
      "Setelah delivery, customer dapat link feedback & promo repeat order.",
    ],
    sales_funnel: [
      { stage: "Awareness", activity: "Posting Instagram + flyer di area kost", target: "500 view/hari pada minggu 1" },
      { stage: "Interest", activity: "Story menu + endorse mikro mahasiswa", target: "10% klik link WhatsApp" },
      { stage: "Decision", activity: "Diskon first-order Rp3rb + free delivery", target: "Konversi 25% dari yang chat" },
      { stage: "Purchase", activity: "Layani order tepat waktu, packaging rapi", target: "30 order/hari di minggu 2" },
      { stage: "Retention", activity: "Loyalty card: order 10 dapat 1 gratis", target: "40% repeat order dalam 30 hari" },
    ],
    pricing_strategy: [
      { strategy: "Anchor Pricing", explanation: "Posisikan menu beef Rp25rb sebagai anchor, mendorong customer pilih menu Rp18-20rb." },
      { strategy: "Bundle Discount", explanation: "Paket 5 box diskon Rp5rb untuk dorong group order." },
      { strategy: "Pre-order Discount", explanation: "Diskon H-1 untuk plan produksi presisi & kurangi bahan terbuang." },
    ],
  },
  operational_plan: {
    operational_flow: [
      { activity: "Belanja bahan baku", ideal_time: "06:00-07:30", note: "Pasar Banyumanik, prioritas bahan basah harian" },
      { activity: "Persiapan & marinasi", ideal_time: "07:30-10:00", note: "Marinasi ayam, potong sayur, masak nasi batch 1" },
      { activity: "Cooking & packing siang", ideal_time: "10:00-11:30", note: "Sesuai order pre-order H-1, finishing per box" },
      { activity: "Delivery cluster siang", ideal_time: "11:30-13:00", note: "Cluster Tembalang, Banjarsari, Sumurboto" },
      { activity: "Cooking & packing malam", ideal_time: "16:00-18:00", note: "Order sore, finishing makanan hangat" },
      { activity: "Delivery cluster malam", ideal_time: "18:00-19:30", note: "Sekaligus rekap penjualan harian" },
    ],
    production_sop: [
      "Cek stock bahan setiap pagi, list belanja sebelum jam 07:00.",
      "Marinasi protein utama minimal 2 jam sebelum cooking untuk konsistensi rasa.",
      "Gunakan timbangan untuk porsi nasi (200gr) & lauk (90gr) agar konsisten.",
      "Suhu sambal/saus dijaga 60-70°C saat packing untuk menghindari basi.",
      "Packing dengan layer alumunium foil + box kraft, beri stiker tanggal & varian.",
      "QC akhir: rasa sample tiap 10 box, cek kebersihan packaging sebelum dikirim.",
    ],
    initial_operational_needs: [
      { item: "Kompor 2 tungku + tabung gas 12kg", function: "Cooking utama 2 menu paralel" },
      { item: "Rice cooker 2L (2 unit)", function: "Stok nasi siang & malam terpisah" },
      { item: "Wajan + alat masak set", function: "Cooking dasar dan stir-fry" },
      { item: "Box kraft food-grade + stiker brand (200pcs)", function: "Packaging awal 1 minggu pertama" },
      { item: "Sealer kantong & alumunium foil", function: "Mempertahankan suhu makanan" },
      { item: "Sepeda motor + tas delivery box", function: "Cluster delivery 2x/hari" },
    ],
    potential_bottlenecks: [
      { problem: "Order spike di hari sibuk", impact: "Telat delivery, customer kecewa", solution: "Cap maksimal 50 order/hari awal, tambah part-timer saat scale" },
      { problem: "Kenaikan harga bahan baku mendadak", impact: "Margin turun signifikan", solution: "Kontrak supplier untuk komoditas utama 2 minggu, alternatif pasar B" },
      { problem: "Cuaca buruk saat delivery", impact: "Telat & box bisa rusak", solution: "Box delivery anti-air & komunikasi proaktif ke customer untuk reschedule" },
    ],
  },
  financial_plan: {
    initial_capital_breakdown: [
      { component: "Peralatan masak (kompor, panci, wajan, dll)", amount: 2500000, note: "Beli baru kelas menengah" },
      { component: "Rice cooker 2L (2 unit)", amount: 700000, note: "Untuk stok nasi siang & malam" },
      { component: "Sepeda motor delivery (sudah dimiliki)", amount: 0, note: "Asset existing, hanya beli tas delivery" },
      { component: "Tas delivery box + cooler", amount: 350000, note: "Mempertahankan suhu" },
      { component: "Stok bahan baku awal 2 minggu", amount: 2000000, note: "Buffer modal kerja awal" },
      { component: "Packaging awal (box, stiker, sealer)", amount: 600000, note: "200 box + sealer" },
      { component: "Marketing awal (flyer, IG ads, content)", amount: 750000, note: "Untuk awareness 30 hari pertama" },
      { component: "Operasional cadangan 2 minggu", amount: 600000, note: "Listrik, gas, air, pulsa" },
    ],
    unit_economics: [
      { product: "Rice Bowl Ayam Geprek", selling_price: 18000, hpp: 8500, gross_profit_per_unit: 9500, gross_margin_percentage: 52.8 },
      { product: "Rice Bowl Ayam Teriyaki", selling_price: 20000, hpp: 9500, gross_profit_per_unit: 10500, gross_margin_percentage: 52.5 },
      { product: "Rice Bowl Beef Blackpepper", selling_price: 25000, hpp: 13000, gross_profit_per_unit: 12000, gross_margin_percentage: 48.0 },
      { product: "Rice Bowl Telur Balado", selling_price: 15000, hpp: 6500, gross_profit_per_unit: 8500, gross_margin_percentage: 56.7 },
    ],
    daily_sales_projection: [
      { product: "Rice Bowl Ayam Geprek", target_units_per_day: 12, daily_revenue: 216000, daily_gross_profit: 114000 },
      { product: "Rice Bowl Ayam Teriyaki", target_units_per_day: 8, daily_revenue: 160000, daily_gross_profit: 84000 },
      { product: "Rice Bowl Beef Blackpepper", target_units_per_day: 4, daily_revenue: 100000, daily_gross_profit: 48000 },
      { product: "Rice Bowl Telur Balado", target_units_per_day: 6, daily_revenue: 90000, daily_gross_profit: 51000 },
    ],
    monthly_projection: {
      operational_days: 26,
      monthly_revenue: 14976000,
      monthly_hpp: 7176000,
      monthly_gross_profit: 7800000,
      monthly_operational_cost: 3200000,
      estimated_monthly_net_profit: 4600000,
    },
    accountability_notes: [
      "Harga bahan baku mengacu pada rata-rata harga Pasar Banyumanik & Tokopedia/Shopee komoditas Q2 2026.",
      "Asumsi 26 hari operasional/bulan (5 hari/minggu, libur Sabtu-Minggu untuk fokus prep & content).",
      "Biaya operasional Rp3,2jt/bulan: gas 400rb, listrik 250rb, packaging 800rb, marketing 600rb, pulsa & internet 250rb, transport delivery 600rb, lain-lain 300rb.",
      "Margin di atas 50% pada menu ayam karena bisnis dijalankan owner-operated (tidak ada gaji koki di awal).",
      "Skenario optimistis (40+ order/hari) butuh tambahan part-timer Rp1,2jt/bulan yang akan menurunkan net profit ~26% di awal.",
    ],
  },
  scenario_analysis_cashflow: {
    break_even_estimation: [
      { scenario: "Konservatif (20 order/hari)", monthly_net_profit: 2300000, estimated_payback_period: "5-6 bulan" },
      { scenario: "Realistis (30 order/hari)", monthly_net_profit: 4600000, estimated_payback_period: "3-4 bulan" },
      { scenario: "Optimistis (45 order/hari)", monthly_net_profit: 6800000, estimated_payback_period: "2-3 bulan" },
    ],
    sales_scenarios: [
      { scenario: "Konservatif", units_per_day: "20 unit", monthly_revenue_estimation: "Rp9,9jt", note: "Awareness rendah, repeat order minim" },
      { scenario: "Realistis", units_per_day: "30 unit", monthly_revenue_estimation: "Rp14,9jt", note: "Eksekusi marketing standar, repeat 30%" },
      { scenario: "Optimistis", units_per_day: "45 unit", monthly_revenue_estimation: "Rp22,5jt", note: "Konten viral, partnership UKM aktif, repeat 45%" },
    ],
    cashflow_rules: [
      "Sisihkan 30% laba bersih untuk re-invest (peralatan tambahan, marketing scale).",
      "Minimal 1 bulan biaya operasional disimpan sebagai cash reserve sebelum scale.",
      "Bayar supplier maksimal 7 hari setelah belanja, hindari tempo terlalu panjang yang berdampak ke harga.",
      "Catat cashflow harian via spreadsheet sederhana — separasi total omzet, HPP harian, dan operasional.",
    ],
    financial_kpis: [
      { kpi: "Gross Margin %", target: ">= 50% rata-rata bulanan" },
      { kpi: "Repeat Order Rate", target: ">= 35% dalam 30 hari" },
      { kpi: "Customer Acquisition Cost", target: "<= Rp4.000/customer baru" },
      { kpi: "Average Order Value", target: ">= Rp22.000 (dorong upsell minuman/topping)" },
    ],
  },
  marketing_plan_30_days: [
    {
      week: "Minggu 1",
      focus: "Awareness & Soft Launch",
      activities: [
        { activity: "Setup Instagram + WhatsApp Business + katalog menu", expected_output: "Profile siap, 4 menu live di katalog" },
        { activity: "Sebar flyer di 10 titik kost area Tembalang", expected_output: "Reach 500+ orang fisik" },
        { activity: "Soft launch ke teman & komunitas (gratis tester 30 box)", expected_output: "30 testimoni + 10 review video" },
      ],
      target: "20 follower Instagram, 30 chat WhatsApp masuk",
    },
    {
      week: "Minggu 2",
      focus: "Konversi Awal",
      activities: [
        { activity: "Promo first-order diskon Rp3rb + free delivery", expected_output: "Konversi >= 25% dari chat masuk" },
        { activity: "Posting konten harian (menu, behind-the-scene, review)", expected_output: "5 post + 7 story per minggu" },
        { activity: "Endorse 2 mikro influencer mahasiswa kampus", expected_output: "Reach 5.000+ akun mahasiswa" },
      ],
      target: "20-25 order/hari rata-rata",
    },
    {
      week: "Minggu 3",
      focus: "Retention & Loyalty",
      activities: [
        { activity: "Launching loyalty card (10 order = 1 gratis)", expected_output: "30+ customer claim kartu loyalty" },
        { activity: "Story testimoni & review customer real", expected_output: "10 story testimoni unik" },
        { activity: "Paket group order untuk UKM/event", expected_output: "3 order grup (10+ porsi)" },
      ],
      target: "Repeat order >= 30%, AOV >= Rp22rb",
    },
    {
      week: "Minggu 4",
      focus: "Scale & Optimize",
      activities: [
        { activity: "Launching menu rotation pertama (limited menu mingguan)", expected_output: "Menu baru diorder 50+ porsi dalam 7 hari" },
        { activity: "Instagram ads micro-targeting area Tembalang", expected_output: "CPC <= Rp1rb, 50 chat masuk" },
        { activity: "Subscription lunch 5 hari ke 2 kantor sekitar kampus", expected_output: "5-10 paket subscription terjual" },
      ],
      target: "30+ order/hari konsisten, 1 kontrak subscription",
    },
  ],
  risk_mitigation_validation: {
    risks: [
      { risk: "Demand di bawah ekspektasi", impact: "Margin turun, susah bayar operasional", mitigation: "Pre-order H-1, cap produksi sesuai chat masuk, marketing organic intensif." },
      { risk: "Bahan baku naik mendadak", impact: "Margin tergerus 10-15%", mitigation: "Kontrak supplier, alternatif pasar, sesuaikan portion control." },
      { risk: "Kualitas tidak konsisten", impact: "Customer churn, review negatif", mitigation: "SOP cooking dengan timbangan, QC tiap 10 box, training rasa rutin." },
      { risk: "Kompetitor baru di area sama", impact: "Customer pindah", mitigation: "Loyalty program, menu rotation, hubungan personal dengan customer." },
    ],
    validation_plan: [
      { validation_area: "Product-market fit menu", target: "30 testimoni positif (rating >= 4/5) di minggu 1-2" },
      { validation_area: "Harga & willingness to pay", target: "Konversi chat ke order >= 25%, complain harga < 5%" },
      { validation_area: "Operasional sustainability", target: "Pengiriman tepat waktu >= 90%, kelelahan owner < 10 jam/hari" },
      { validation_area: "Channel akuisisi", target: "Identifikasi top 2 channel dengan CAC paling rendah" },
    ],
    decision_rules: [
      { condition: "Order < 15/hari di akhir minggu 4", decision: "Evaluasi ulang menu/harga/positioning sebelum scaling marketing budget." },
      { condition: "Margin kotor < 45% rata-rata", decision: "Negosiasi ulang supplier atau naikkan harga 5-10%." },
      { condition: "Repeat order < 25% di bulan 2", decision: "Re-design loyalty program & investigasi pain point customer." },
      { condition: "Order > 40/hari konsisten", decision: "Rekrut 1 part-timer dan tambah kapasitas dapur." },
    ],
  },
  execution_roadmap: {
    roadmap_90_days: [
      { period: "Bulan 1 (Hari 1-30)", focus: "Setup & Soft Launch", target: "MVP 4 menu live, 20-25 order/hari, 30 testimoni." },
      { period: "Bulan 2 (Hari 31-60)", focus: "Optimasi & Retention", target: "30 order/hari konsisten, repeat 35%, 1 menu baru launch." },
      { period: "Bulan 3 (Hari 61-90)", focus: "Scale & Subscription", target: "40+ order/hari, 2-3 kontrak subscription, BEP tercapai." },
    ],
    execution_checklist: [
      { area: "Legal & Administrasi", checklist: "Daftar PIRT, izin lokasi, NPWP UMKM (jika applicable)." },
      { area: "Operasional", checklist: "SOP cooking, supplier kontrak, jadwal harian, packaging stok 1 minggu." },
      { area: "Branding & Marketing", checklist: "Instagram + WA Business setup, katalog, content kalender 30 hari, flyer cetak." },
      { area: "Finansial", checklist: "Spreadsheet cashflow, rekening terpisah usaha, pencatatan harian." },
      { area: "Validasi", checklist: "Form testimoni, follow-up customer, weekly review metrics." },
    ],
    strategic_recommendation:
      "Fokus penuh pada konsistensi rasa & ketepatan waktu di 30 hari pertama untuk membangun trust. Hindari scaling marketing prematur — biarkan word-of-mouth dari komunitas mahasiswa bekerja. Investasi marketing baru ditingkatkan setelah repeat rate stabil >= 35%.",
    final_verdict:
      "Bisnis Rice Bowl Pre-order layak dijalankan dengan modal Rp7,5jt. Peluang BEP 3-4 bulan realistis tercapai jika eksekusi disiplin di pre-order, kontrol porsi, dan engagement komunitas. Direkomendasikan untuk go-live setelah validasi 30 testimoni positif di minggu 1-2.",
    disclaimer:
      "Semua angka adalah estimasi berbasis data publik dan asumsi industri Q2 2026. Variabel harga supplier, kompetisi lokal, dan kondisi makro bisa mempengaruhi hasil aktual. Validasi langsung di lokasi sebelum eksekusi penuh.",
  },
};

const mockProjection: FinancialProjection = {
  operatingDays: 26,
  products: [],
  totalInitialCapital: 7500000,
  monthlyOperationalCost: 3200000,
  monthlyRevenue: 14976000,
  monthlyGrossProfit: 7800000,
  monthlyNetProfit: 4600000,
  paybackPeriodMonth: 4,
  scenarios: {
    conservative: { label: "Konservatif", factor: 0.7, monthlyRevenue: 9900000, monthlyGrossProfit: 5200000, monthlyNetProfit: 2300000, paybackPeriodMonth: 6 },
    normal: { label: "Realistis", factor: 1.0, monthlyRevenue: 14976000, monthlyGrossProfit: 7800000, monthlyNetProfit: 4600000, paybackPeriodMonth: 4 },
    optimistic: { label: "Optimistis", factor: 1.4, monthlyRevenue: 22500000, monthlyGrossProfit: 11500000, monthlyNetProfit: 6800000, paybackPeriodMonth: 2 },
  },
};

const mockPlan = {
  id: "test-plan-id",
  capitalRange: "Rp5-10 juta",
  selectedIdeaName: "Rice Bowl Pre-order",
  locationCity: "Semarang",
  areaType: "kampus",
  createdAt: new Date(),
} as unknown as BusinessPlan;

async function main() {
  // Render PREMIUM variant
  const premiumOrder = {
    packageType: "PREMIUM",
  } as unknown as import("@prisma/client").Order;
  const premiumDoc = renderPlanDocument({
    plan: mockPlan,
    order: premiumOrder,
    ai: mockAi,
    projection: mockProjection,
  });

  // Render BASIC variant
  const basicOrder = {
    packageType: "BASIC",
  } as unknown as import("@prisma/client").Order;
  const basicDoc = renderPlanDocument({
    plan: mockPlan,
    order: basicOrder,
    ai: mockAi,
    projection: mockProjection,
  });

  const outDir = resolve(process.cwd(), "tmp");
  mkdirSync(outDir, { recursive: true });

  writeFileSync(resolve(outDir, "test-premium.html"), premiumDoc.html);
  writeFileSync(resolve(outDir, "test-basic.html"), basicDoc.html);
  console.log(
    `HTML rendered: tmp/test-premium.html (${premiumDoc.html.length} chars), tmp/test-basic.html (${basicDoc.html.length} chars)`
  );

  // Convert to actual PDFs
  console.log("Launching Puppeteer...");
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
  try {
    for (const [name, doc] of [
      ["premium", premiumDoc],
      ["basic", basicDoc],
    ] as const) {
      const page = await browser.newPage();
      await page.setContent(doc.html, {
        waitUntil: ["domcontentloaded", "load"],
      });
      await page.emulateMediaType("screen");
      const buf = await page.pdf({
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: doc.headerTemplate,
        footerTemplate: doc.footerTemplate,
        margin: { top: "18mm", right: "12mm", bottom: "16mm", left: "12mm" },
      });
      const pdfPath = resolve(outDir, `test-${name}.pdf`);
      writeFileSync(pdfPath, buf);
      console.log(`PDF rendered: ${pdfPath} (${(buf.length / 1024).toFixed(1)} KB)`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
