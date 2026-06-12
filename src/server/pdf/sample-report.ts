import type { AiSelfDiscoveryReport } from "@/server/ai/schemas";

/**
 * Build a sample Self Discovery Report for the public "Lihat Contoh" button
 * and the admin PDF test page. Uses the "Creative Strategist" archetype.
 */
export function buildSampleReport(): AiSelfDiscoveryReport {
  return {
    cover: {
      title: "Self Discovery Report",
      personality_title: "Creative Strategist",
      tagline: "Kamu mikir pakai ide, gerak pakai rasa penasaran.",
      identity_label: "Kreatif + Komunikatif",
      short_summary:
        "Kamu cenderung kreatif, suka mengeksplorasi ide baru, dan berkembang paling baik di lingkungan yang fleksibel dan kolaboratif.",
    },
    personality_overview: {
      overview:
        "Sebagai Creative Strategist, kamu punya kombinasi langka antara imajinasi dan kemampuan menyusun ide jadi sesuatu yang nyata. Kamu cepat bosan dengan hal yang monoton, tapi bisa sangat fokus saat mengerjakan sesuatu yang kamu anggap menarik dan bermakna.",
      core_identity:
        "Inti dirimu adalah rasa ingin tahu yang tinggi dipadu dengan kebutuhan untuk berekspresi. Kamu memandang dunia sebagai kumpulan kemungkinan yang bisa dikombinasikan jadi ide baru.",
      dominant_traits: [
        { trait: "creativity", score: 90, explanation: "Kamu mudah menghasilkan ide dan melihat kemungkinan yang tidak dilihat orang lain." },
        { trait: "exploration", score: 84, explanation: "Kamu senang mencoba hal baru dan belajar dari pengalaman langsung." },
        { trait: "communication", score: 78, explanation: "Kamu nyaman menyampaikan ide dan memengaruhi orang lain." },
      ],
      thinking_pattern:
        "Pola pikirmu cenderung divergen — kamu memulai dari banyak kemungkinan sebelum menyaringnya. Ini membuatmu kreatif, tapi kadang perlu bantuan struktur untuk menyelesaikan satu hal sampai tuntas.",
    },
    strength_weakness: {
      strengths: [
        { title: "Kreatif & visioner", description: "Kamu unggul dalam menghasilkan ide dan melihat gambaran besar." },
        { title: "Adaptif", description: "Kamu cepat menyesuaikan diri dengan situasi dan tantangan baru." },
        { title: "Komunikator natural", description: "Kamu bisa menyampaikan ide dengan cara yang menarik." },
      ],
      weaknesses: [
        { title: "Mudah bosan dengan rutinitas", description: "Pekerjaan yang repetitif menurunkan motivasimu dengan cepat." },
        { title: "Fokus mudah terpecah", description: "Banyaknya ide kadang membuatmu sulit menyelesaikan satu hal." },
        { title: "Kurang nyaman dengan aturan kaku", description: "Lingkungan yang terlalu terstruktur bisa membatasimu." },
      ],
      balancing_note:
        "Kekuatan dan kelemahanmu berasal dari sumber yang sama: pikiran yang aktif. Kuncinya adalah memilih lingkungan yang menghargai ide sambil melatih disiplin penyelesaian.",
    },
    top_jurusan_match: [
      { jurusan: "Desain Komunikasi Visual", match_percentage: 92, reason: "Memberi ruang penuh untuk kreativitas visual dan eksplorasi ide.", career_example: "UI/UX Designer, Art Director, Creative Director" },
      { jurusan: "Ilmu Komunikasi", match_percentage: 87, reason: "Cocok dengan kemampuan komunikasi dan storytelling kamu.", career_example: "Content Strategist, PR Specialist, Brand Manager" },
      { jurusan: "Marketing / Bisnis Digital", match_percentage: 83, reason: "Menggabungkan kreativitas dengan strategi dan eksekusi.", career_example: "Digital Marketer, Growth Strategist" },
      { jurusan: "Desain Produk", match_percentage: 79, reason: "Pas untuk kamu yang suka menciptakan solusi yang fungsional dan estetik.", career_example: "Product Designer, Industrial Designer" },
      { jurusan: "Psikologi", match_percentage: 74, reason: "Sesuai dengan kepekaanmu memahami orang dan motivasi mereka.", career_example: "UX Researcher, HR, Konselor" },
    ],
    career_direction: {
      summary:
        "Arah karirmu paling berkembang di bidang yang menggabungkan kreativitas, komunikasi, dan strategi. Kamu cocok di peran yang memberi ruang untuk menciptakan dan memimpin ide.",
      paths: [
        { field: "Creative & Design", progression: "UI/UX Designer → Product Designer → Creative Director", explanation: "Jalur yang memanfaatkan kemampuan visual dan strategis kamu." },
        { field: "Brand & Marketing", progression: "Content Creator → Brand Strategist → Marketing Lead", explanation: "Jalur yang menggabungkan kreativitas dengan dampak bisnis." },
      ],
    },
    future_lifestyle: {
      work_style: "Kamu paling produktif saat punya kebebasan mengatur cara dan ritme kerja, dengan proyek yang bervariasi.",
      work_environment: "Lingkungan kolaboratif, kreatif, dan tidak terlalu hierarkis paling cocok untukmu.",
      work_pressure: "Kamu bisa menghadapi tekanan selama tujuannya jelas dan ada ruang untuk berkreasi mencari solusi.",
      lifestyle_compatibility: "Gaya hidup dinamis dengan keseimbangan antara eksplorasi dan waktu untuk recharge ide.",
    },
    warning_area: {
      warnings: [
        { area: "Pekerjaan repetitif & monoton", explanation: "Rutinitas tanpa variasi cepat menguras motivasimu.", suggestion: "Cari peran dengan proyek bervariasi atau elemen kreatif rutin." },
        { area: "Lingkungan terlalu kaku", explanation: "Aturan ketat tanpa ruang inisiatif bisa membuatmu frustrasi.", suggestion: "Pilih tempat yang menghargai ide dan eksperimen." },
      ],
    },
    self_development_advice: {
      advices: [
        { focus: "Konsistensi eksekusi", why: "Kamu kuat di ide, tapi dampak datang dari penyelesaian.", action: "Pilih 1 proyek dan selesaikan sampai tuntas bulan ini." },
        { focus: "Manajemen fokus", why: "Banyak minat bisa memecah energimu.", action: "Tentukan 1-2 prioritas utama tiap semester." },
        { focus: "Skill teknis pendukung", why: "Ide kreatif lebih bernilai jika didukung skill eksekusi.", action: "Pelajari 1 tool/skill teknis di bidang yang kamu minati." },
      ],
    },
    skill_roadmap: {
      phases: [
        { phase: "Sekarang - 6 bulan", focus: "Eksplorasi & dasar", skills: ["Kenali minat lebih dalam", "Skill desain/komunikasi dasar", "Bangun kebiasaan menyelesaikan tugas"] },
        { phase: "6 - 12 bulan", focus: "Bangun portofolio", skills: ["Proyek kreatif nyata", "Belajar dari komunitas/mentor", "Personal branding"] },
        { phase: "1 - 2 tahun", focus: "Spesialisasi", skills: ["Pendalaman keahlian utama", "Kolaborasi tim", "Eksperimen lintas bidang"] },
      ],
    },
    closing: {
      strategic_recommendation:
        "Sebagai Creative Strategist, pilih jurusan dan lingkungan yang memberi ruang untuk kreativitas dan komunikasimu berkembang. Hindari jalur yang menuntut rutinitas kaku tanpa ruang ide.",
      final_note:
        "Hasil ini adalah titik awal untuk lebih mengenal dirimu. Gunakan sebagai bahan refleksi dan diskusi sebelum menentukan arah masa depanmu.",
      disclaimer:
        "Dokumen ini adalah contoh output JuruScope. Hasil merupakan panduan untuk mengenal diri dan menentukan arah, bukan keputusan mutlak.",
    },
  };
}
