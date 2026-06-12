/**
 * Legal page content data — kept separate from the UI so admin/team
 * can update copy without touching React components.
 */

export type LegalSection = {
  id: string;
  title: string;
  body: string[];
};

export type LegalDocument = {
  slug: "terms" | "privacy" | "refund";
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

const LAST_UPDATED = "26 Mei 2026";

export const TERMS_DOC: LegalDocument = {
  slug: "terms",
  title: "Syarat & Ketentuan",
  description:
    "Aturan singkat penggunaan layanan JuruScope.",
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      id: "pendahuluan",
      title: "1. Pendahuluan",
      body: [
        "Dengan menggunakan JuruScope, kamu setuju dengan syarat dan ketentuan ini.",
        "Jika kamu tidak setuju, mohon untuk tidak menggunakan layanan ini.",
      ],
    },
    {
      id: "layanan",
      title: "2. Layanan",
      body: [
        "JuruScope adalah platform AI self discovery yang membantu pengguna mengenali kepribadian, minat, dan jurusan yang cocok berbasis AI.",
        "Hasil gratis berisi personality identity dan rekomendasi jurusan teaser. Paket berbayar dapat menghasilkan self discovery report lengkap dalam format PDF.",
      ],
    },
    {
      id: "penggunaan",
      title: "3. Penggunaan Layanan",
      body: [
        "Pengguna wajib mengisi data dengan benar, seperti nama, email, usia, kelas, dan jawaban quiz yang jujur sesuai dirinya.",
        "Pengguna dilarang menyalahgunakan layanan untuk aktivitas ilegal, spam, manipulasi sistem, atau tindakan yang merugikan JuruScope maupun pengguna lain.",
      ],
    },
    {
      id: "pembayaran",
      title: "4. Pembayaran",
      body: [
        "Harga paket dapat berubah sewaktu-waktu sesuai kebijakan JuruScope.",
        "Pembayaran diproses melalui penyedia pembayaran pihak ketiga.",
        "Akses ke fitur berbayar diberikan setelah pembayaran berhasil dikonfirmasi.",
      ],
    },
    {
      id: "hasil-ai",
      title: "5. Hasil AI",
      body: [
        "Hasil personality dan rekomendasi jurusan bersifat panduan dan referensi untuk mengenal diri, bukan keputusan mutlak atau jaminan keberhasilan akademik.",
        "Hasil dapat berbeda tergantung kejujuran dan konsistensi jawaban pengguna.",
        "Pengguna tetap perlu melakukan refleksi, diskusi dengan orang tua atau guru, dan pertimbangan lain sebelum menentukan jurusan.",
        "Seluruh keputusan terkait jurusan dan masa depan menjadi tanggung jawab pengguna.",
      ],
    },
    {
      id: "hak-konten",
      title: "6. Hak Konten",
      body: [
        "Brand, logo, sistem, desain, dan template JuruScope merupakan milik JuruScope.",
        "Dokumen PDF yang dihasilkan boleh digunakan untuk kebutuhan pribadi pengguna.",
        "Pengguna dilarang menjual ulang, menyalin, atau mendistribusikan ulang dokumen dan template dari JuruScope tanpa izin.",
      ],
    },
    {
      id: "batasan-tanggung-jawab",
      title: "7. Batasan Tanggung Jawab",
      body: [
        "JuruScope tidak bertanggung jawab atas keputusan jurusan, akademik, atau masa depan yang dibuat berdasarkan hasil dari layanan ini.",
        "Kami berupaya menjaga layanan tetap berjalan dengan baik, namun tidak menjamin layanan selalu bebas dari gangguan, kesalahan, atau keterlambatan.",
      ],
    },
    {
      id: "perubahan",
      title: "8. Perubahan Ketentuan",
      body: [
        "JuruScope dapat memperbarui syarat dan ketentuan ini dari waktu ke waktu.",
        "Versi terbaru akan ditampilkan di halaman ini.",
      ],
    },
    {
      id: "kontak",
      title: "9. Kontak",
      body: [
        "Untuk pertanyaan terkait syarat dan ketentuan, hubungi support@juruscope.id.",
      ],
    },
  ],
};

export const PRIVACY_DOC: LegalDocument = {
  slug: "privacy",
  title: "Kebijakan Privasi",
  description:
    "Penjelasan singkat tentang bagaimana JuruScope menggunakan dan melindungi data pengguna.",
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      id: "privacy-pendahuluan",
      title: "1. Pendahuluan",
      body: [
        "JuruScope menghargai privasi pengguna. Kebijakan ini menjelaskan secara singkat data apa yang kami gunakan dan bagaimana kami menjaganya.",
        "Dengan menggunakan layanan JuruScope, kamu memahami dan menyetujui kebijakan privasi ini.",
      ],
    },
    {
      id: "data-yang-dikumpulkan",
      title: "2. Data yang Kami Kumpulkan",
      body: [
        "Kami dapat mengumpulkan data yang kamu isi saat menggunakan layanan, seperti nama, email, usia, kelas, sekolah, dan jawaban quiz self discovery.",
        "Kami juga menyimpan data pesanan dan transaksi, seperti paket yang dipilih, status pembayaran, waktu transaksi, dan dokumen yang dihasilkan.",
      ],
    },
    {
      id: "penggunaan-data",
      title: "3. Penggunaan Data",
      body: [
        "Data digunakan untuk membuat hasil analisis kepribadian, menghasilkan report PDF, memproses pesanan, mengirim hasil ke email, dan membantu jika kamu menghubungi support.",
        "Kami juga dapat menggunakan data secara umum untuk meningkatkan kualitas layanan dan mencegah penyalahgunaan platform.",
      ],
    },
    {
      id: "pihak-ketiga",
      title: "4. Pihak Ketiga",
      body: [
        "Kami dapat menggunakan layanan pihak ketiga untuk membantu menjalankan layanan, seperti pembayaran, pengiriman email, penyimpanan dokumen, hosting, dan teknologi AI.",
        "Pihak ketiga hanya menerima data yang diperlukan sesuai fungsinya. Kami tidak menjual data pribadi pengguna kepada pihak lain.",
      ],
    },
    {
      id: "keamanan-data",
      title: "5. Keamanan Data",
      body: [
        "Kami berupaya menjaga keamanan data pengguna dengan langkah yang wajar sesuai kebutuhan layanan.",
        "Namun, tidak ada sistem digital yang sepenuhnya bebas risiko. Karena itu, pengguna juga disarankan untuk tidak membagikan data pribadi yang tidak diperlukan saat menggunakan layanan.",
      ],
    },
    {
      id: "penyimpanan-data",
      title: "6. Penyimpanan Data",
      body: [
        "Data dapat disimpan selama diperlukan untuk menjalankan layanan, menyelesaikan kendala pengguna, memenuhi kebutuhan administrasi, dan mematuhi ketentuan hukum yang berlaku.",
        "Jika data tidak lagi diperlukan, kami dapat menghapus atau menganonimkannya.",
      ],
    },
    {
      id: "hak-pengguna",
      title: "7. Hak Pengguna",
      body: [
        "Pengguna dapat meminta perbaikan atau penghapusan data pribadi dengan menghubungi support, selama permintaan tersebut tidak bertentangan dengan kewajiban hukum, administrasi, atau penyelesaian transaksi.",
      ],
    },
    {
      id: "perubahan-kebijakan",
      title: "8. Perubahan Kebijakan",
      body: [
        "Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Versi terbaru akan ditampilkan di halaman ini.",
      ],
    },
    {
      id: "kontak-privacy",
      title: "9. Kontak",
      body: [
        "Untuk pertanyaan terkait privasi atau data pribadi, hubungi support@juruscope.id.",
      ],
    },
  ],
};

export const REFUND_DOC: LegalDocument = {
  slug: "refund",
  title: "Kebijakan Refund",
  description:
    "Ketentuan singkat pengembalian dana untuk layanan JuruScope.",
  lastUpdated: LAST_UPDATED,
  sections: [
    {
      id: "prinsip-umum",
      title: "1. Prinsip Umum",
      body: [
        "JuruScope menyediakan layanan digital berupa hasil self discovery dan self discovery report.",
        "Karena layanan bersifat digital, refund hanya berlaku untuk kondisi tertentu.",
        "Permintaan refund maksimal diajukan dalam 7 hari setelah pembayaran berhasil.",
      ],
    },
    {
      id: "refund-dapat-diberikan",
      title: "2. Refund Dapat Diberikan Jika",
      body: [
        "Pembayaran berhasil, tetapi dokumen gagal dibuat karena kendala dari sistem JuruScope.",
        "Terjadi pembayaran ganda untuk pesanan yang sama.",
        "Dokumen tidak dapat dikirim atau diakses, dan tim support tidak dapat membantu menyelesaikannya.",
      ],
    },
    {
      id: "refund-tidak-berlaku",
      title: "3. Refund Tidak Berlaku Jika",
      body: [
        "Pengguna berubah pikiran setelah pembayaran berhasil dan dokumen sudah dibuat.",
        "Pengguna salah memilih paket atau salah mengisi data saat menggunakan layanan.",
        "Hasil analisis atau report tidak sesuai ekspektasi pengguna.",
        "Pengguna merasa hasil tidak sesuai harapan setelah menggunakan hasil dari JuruScope.",
        "Permintaan refund diajukan lebih dari 7 hari setelah pembayaran berhasil.",
      ],
    },
    {
      id: "solusi-sebelum-refund",
      title: "4. Solusi Sebelum Refund",
      body: [
        "Jika terjadi kendala, tim support dapat membantu mengirim ulang dokumen, memperbaiki akses, atau membuat ulang dokumen jika masalah berasal dari sistem.",
        "Refund akan diproses jika kendala tidak dapat diselesaikan oleh tim support.",
      ],
    },
    {
      id: "cara-mengajukan",
      title: "5. Cara Mengajukan Refund",
      body: [
        "Kirim email ke support@juruscope.id dengan subjek 'Refund Request'.",
        "Sertakan order code, email yang digunakan saat pembayaran, tanggal pembayaran, bukti pembayaran, dan alasan pengajuan refund.",
        "Order code diperlukan agar tim support dapat mencocokkan data pembayaran dan pesanan dengan lebih cepat.",
      ],
    },
    {
      id: "proses-refund",
      title: "6. Proses Refund",
      body: [
        "Tim support akan meninjau permintaan refund dalam 1-3 hari kerja.",
        "Jika refund disetujui, dana akan dikembalikan melalui metode yang tersedia sesuai proses penyedia pembayaran.",
        "Waktu dana masuk dapat berbeda tergantung metode pembayaran dan kebijakan penyedia pembayaran.",
      ],
    },
    {
      id: "biaya-refund",
      title: "7. Biaya Refund",
      body: [
        "Biaya layanan pembayaran, biaya transfer, atau potongan dari pihak penyedia pembayaran dapat mengurangi jumlah dana yang dikembalikan jika berlaku.",
      ],
    },
    {
      id: "kontak-refund",
      title: "8. Kontak",
      body: [
        "Untuk pertanyaan terkait refund, hubungi support@juruscope.id.",
      ],
    },
  ],
};

export const LEGAL_DOCS: Record<"terms" | "privacy" | "refund", LegalDocument> = {
  terms: TERMS_DOC,
  privacy: PRIVACY_DOC,
  refund: REFUND_DOC,
};

export const LEGAL_TABS: Array<{
  slug: "terms" | "privacy" | "refund";
  label: string;
  shortLabel: string;
}> = [
  { slug: "terms", label: "Syarat & Ketentuan", shortLabel: "Terms" },
  { slug: "privacy", label: "Kebijakan Privasi", shortLabel: "Privacy" },
  { slug: "refund", label: "Kebijakan Refund", shortLabel: "Refund" },
];
