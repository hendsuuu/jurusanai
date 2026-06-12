export type WizardOption = {
  value: string;
  label: string;
  description?: string;
  icon?: string;
};

/**
 * JuruScope self-discovery quiz.
 *
 * NOTE: The underlying field keys are reused from the original planner
 * (capitalRange, areaType, categoryInterest, sellingModel, availableTime,
 * assets, targetIncome, riskPreference, marginPreference) so no DB/schema
 * migration is needed. Only the user-facing labels are behavior-based
 * self-discovery questions. The AI maps these answers into personality
 * traits + jurusan matching.
 */

// capitalRange → Daily Energy
export const CAPITAL_OPTIONS: WizardOption[] = [
  { value: "bikin sesuatu kreatif", label: "Bikin sesuatu yang kreatif", description: "Gambar, desain, nulis, musik, atau bikin konten." },
  { value: "ngobrol sama orang", label: "Ngobrol & ketemu orang", description: "Energi kamu datang dari interaksi sosial." },
  { value: "belajar skill baru", label: "Belajar skill / hal baru", description: "Suka mendalami sesuatu sampai paham." },
  { value: "eksplor hal baru", label: "Eksplor hal baru", description: "Coba tempat, ide, atau pengalaman baru." },
  { value: "menyelesaikan masalah", label: "Memecahkan masalah", description: "Senang menganalisis dan cari solusi." },
  { value: "recharge santai", label: "Recharge & me time", description: "Butuh ketenangan untuk mengisi energi." },
];

// ageRange -> User age context
export const AGE_RANGE_OPTIONS: WizardOption[] = [
  { value: "12-14 tahun", label: "12-14 tahun", description: "Biasanya fase awal eksplorasi minat." },
  { value: "15-17 tahun", label: "15-17 tahun", description: "Mulai memikirkan jurusan dan arah sekolah." },
  { value: "18-20 tahun", label: "18-20 tahun", description: "Fase memilih kuliah, gap year, atau langkah awal karir." },
  { value: "21 tahun ke atas", label: "21 tahun ke atas", description: "Untuk refleksi ulang jurusan, karir, atau arah hidup." },
];

// areaType → Future Lifestyle
export const AREA_OPTIONS: WizardOption[] = [
  { value: "kota besar dinamis", label: "Kota besar yang dinamis" },
  { value: "fleksibel remote", label: "Kerja fleksibel / remote" },
  { value: "lingkungan kreatif", label: "Lingkungan kreatif & bebas" },
  { value: "stabil terstruktur", label: "Stabil & terstruktur" },
  { value: "banyak ketemu orang", label: "Banyak ketemu orang" },
  { value: "tenang fokus", label: "Tenang & fokus" },
  { value: "belum tahu", label: "Belum kebayang" },
];

// categoryInterest → Curiosity & Interest
export const CATEGORY_OPTIONS: WizardOption[] = [
  { value: "Seni & Desain", label: "Seni & Desain" },
  { value: "Teknologi", label: "Teknologi & Coding" },
  { value: "Bisnis", label: "Bisnis & Uang" },
  { value: "Sosial & Manusia", label: "Manusia & Psikologi" },
  { value: "Sains", label: "Sains & Riset" },
  { value: "Komunikasi & Media", label: "Komunikasi & Media" },
  { value: "Kesehatan", label: "Kesehatan" },
  { value: "Belum tahu", label: "Masih bingung" },
];

// sellingModel → Work Style
export const SELLING_OPTIONS: WizardOption[] = [
  { value: "kerja sendiri", label: "Kerja sendiri & mandiri" },
  { value: "kerja tim", label: "Kerja dalam tim" },
  { value: "memimpin", label: "Memimpin & mengarahkan" },
  { value: "di balik layar", label: "Di balik layar" },
  { value: "fleksibel", label: "Fleksibel, tergantung mood" },
  { value: "belum tahu", label: "Belum tahu" },
];

// availableTime → Natural Behavior (cara menyelesaikan tugas)
export const TIME_OPTIONS: WizardOption[] = [
  { value: "terencana", label: "Terencana & rapi", description: "Suka bikin rencana sebelum mulai." },
  { value: "spontan", label: "Spontan & mengalir", description: "Jalan dulu, beresin sambil jalan." },
  { value: "deadline driven", label: "Maksimal saat mepet deadline" },
  { value: "konsisten pelan", label: "Konsisten & pelan tapi pasti" },
];

// assets → Creative & Analytical Identity + skills (multi-select)
export const ASSET_OPTIONS: WizardOption[] = [
  { value: "imajinatif", label: "Imajinatif / penuh ide" },
  { value: "analitis", label: "Analitis / logis" },
  { value: "komunikatif", label: "Pandai berkomunikasi" },
  { value: "detail", label: "Teliti & detail" },
  { value: "empati", label: "Peka & empati ke orang" },
  { value: "pemimpin", label: "Berjiwa pemimpin" },
  { value: "eksekutor", label: "Eksekutor / cepat bertindak" },
  { value: "visioner", label: "Visioner / mikir jangka panjang" },
  { value: "belum tahu", label: "Belum tahu" },
];

// targetIncome → Future ambition / motivation
export const INCOME_OPTIONS: WizardOption[] = [
  { value: "berkarya & berekspresi", label: "Berkarya & berekspresi" },
  { value: "membantu orang", label: "Membantu banyak orang" },
  { value: "stabil & aman", label: "Hidup stabil & aman" },
  { value: "sukses & berpengaruh", label: "Sukses & berpengaruh" },
  { value: "bebas & fleksibel", label: "Bebas & fleksibel" },
];

// riskPreference → Social & Communication
export const RISK_OPTIONS: WizardOption[] = [
  { value: "ekstrovert", label: "Aktif & ramai", description: "Suka jadi pusat interaksi." },
  { value: "ambivert", label: "Tergantung situasi", description: "Bisa ramai, bisa tenang." },
  { value: "introvert", label: "Lebih suka kelompok kecil", description: "Nyaman dengan sedikit orang dekat." },
];

// marginPreference → Decision style
export const MARGIN_OPTIONS: WizardOption[] = [
  { value: "logika", label: "Pakai logika", description: "Keputusan berdasarkan fakta & analisis." },
  { value: "perasaan", label: "Pakai perasaan", description: "Mempertimbangkan nilai & orang lain." },
  { value: "seimbang", label: "Seimbang", description: "Campur logika dan perasaan." },
  { value: "intuisi", label: "Ikut intuisi", description: "Percaya pada feeling/gut." },
];

export const TOTAL_STEPS = 11;
