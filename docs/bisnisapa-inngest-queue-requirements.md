# Spesifikasi Implementasi Queue Background Job dengan Inngest untuk BisnisApa AI

Dokumen ini berisi rancangan gabungan untuk menambahkan fitur **background queue menggunakan Inngest** pada aplikasi **BisnisApa AI**.

Tujuan utama fitur ini adalah memindahkan proses berat setelah pembayaran, seperti generate AI content, generate PDF, upload ke Cloudflare R2, dan kirim email, agar tidak dijalankan langsung di webhook Midtrans.

Webhook Midtrans harus ringan, cepat, idempotent, dan hanya bertugas memvalidasi pembayaran, mengubah status order, lalu mengirim event ke Inngest.

---

## 1. Konteks Aplikasi

Aplikasi BisnisApa AI memiliki flow utama:

1. User mengisi form bisnis.
2. User memilih paket Basic atau Premium.
3. User melakukan pembayaran melalui Midtrans Redirect.
4. Setelah pembayaran berhasil, sistem membuat business plan menggunakan AI.
5. Hasil AI dibuat menjadi PDF.
6. PDF diupload ke Cloudflare R2.
7. Link PDF disimpan ke database.
8. Link PDF dikirim ke email user.
9. Admin dapat memantau status pesanan dari dashboard.

Masalah yang ingin diselesaikan:

- Webhook Midtrans berisiko timeout jika proses AI/PDF dijalankan langsung.
- Generate AI dan PDF bisa memakan waktu lama.
- Jika OpenAI, PDF renderer, R2, atau email provider gagal, order bisa tersangkut.
- Sulit memantau order yang masih antre, sedang diproses, selesai, atau gagal.
- Jika traffic mulai naik, server bisa berat karena banyak proses berjalan bersamaan.

Solusi:

Gunakan **Inngest** sebagai background job queue dan workflow orchestrator.

---

## 2. Tujuan Implementasi

Fitur ini harus memenuhi tujuan berikut:

1. Webhook Midtrans tidak menjalankan proses generate AI/PDF secara langsung.
2. Setelah pembayaran sukses, webhook hanya update database dan mengirim event ke Inngest.
3. Inngest menjalankan proses berat di background.
4. Proses background memiliki retry otomatis jika terjadi error sementara.
5. Status order/generate tersimpan di database agar bisa dibaca oleh user dan admin.
6. Admin dapat melihat apakah pesanan masih antre, sedang diproses, selesai, atau gagal.
7. Admin dapat melakukan retry untuk order yang gagal.
8. Status endpoint untuk user hanya membaca database dan tidak memicu proses generate baru.
9. Sistem harus idempotent agar duplicate webhook/event tidak membuat PDF/email ganda.
10. Sistem memiliki logging dan audit trail untuk membantu debugging.

---

## 3. Flow Utama Sistem

```txt
User isi form bisnis
        ↓
User pilih paket Basic / Premium
        ↓
User bayar via Midtrans
        ↓
Midtrans kirim webhook ke sistem
        ↓
Sistem validasi signature Midtrans
        ↓
Jika pembayaran sukses:
- payment_status = PAID
- generation_status = QUEUED
- paid_at = now()
- queued_at = now()
- kirim event ke Inngest
        ↓
Webhook langsung return HTTP 200
        ↓
Inngest mulai menjalankan background job
        ↓
generation_status = GENERATING
        ↓
Generate business plan content menggunakan AI
        ↓
Generate PDF berdasarkan template Basic/Premium
        ↓
Upload PDF ke Cloudflare R2
        ↓
Simpan pdf_url ke database
        ↓
Kirim email berisi link PDF ke user
        ↓
generation_status = COMPLETED
```

Jika gagal:

```txt
Step gagal
        ↓
Inngest retry otomatis
        ↓
Jika tetap gagal setelah retry:
- generation_status = FAILED
- error_message disimpan
- failed_at = now()
        ↓
Admin dapat melakukan retry dari dashboard
```

---

## 4. Pembagian Tanggung Jawab Sistem

| Komponen | Tanggung Jawab |
|---|---|
| Midtrans | Memproses pembayaran dan mengirim webhook |
| Webhook Handler | Validasi pembayaran, update status, kirim event ke Inngest |
| Inngest | Menjalankan background job, retry, queue, dan workflow |
| OpenAI / AI Provider | Generate business plan content |
| PDF Template | Mengubah AI result menjadi file PDF |
| Cloudflare R2 | Menyimpan file PDF |
| Resend / Email Provider | Mengirim link PDF ke user |
| Database | Menyimpan order, status, hasil AI, pdf_url, error, timestamp |
| Admin Dashboard | Monitoring order dan melakukan retry jika gagal |

---

## 5. Status yang Dibutuhkan

Gunakan dua jenis status: status pembayaran dan status generate.

### Payment Status

```ts
type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "EXPIRED"
  | "FAILED"
  | "CANCELLED";
```

Penjelasan:

| Status | Arti |
|---|---|
| PENDING | User belum menyelesaikan pembayaran |
| PAID | Pembayaran berhasil |
| EXPIRED | Pembayaran kedaluwarsa |
| FAILED | Pembayaran gagal |
| CANCELLED | Pembayaran dibatalkan |

### Generation Status

```ts
type GenerationStatus =
  | "PENDING"
  | "QUEUED"
  | "GENERATING"
  | "COMPLETED"
  | "FAILED";
```

Penjelasan:

| Status | Arti |
|---|---|
| PENDING | Belum masuk proses generate |
| QUEUED | Sudah masuk antrean Inngest |
| GENERATING | Sedang diproses oleh Inngest |
| COMPLETED | PDF selesai dibuat, diupload, dan siap diunduh |
| FAILED | Proses generate gagal setelah retry |

Flow status generate:

```txt
PENDING → QUEUED → GENERATING → COMPLETED
                         ↓
                       FAILED
```

Catatan:

- Gunakan `QUEUED` agar admin bisa membedakan order yang sudah masuk antrean tetapi belum diproses.
- Gunakan `GENERATING` begitu Inngest mulai memproses job, sebelum proses AI dimulai.
- Gunakan `COMPLETED` ketika PDF sudah siap dan link sudah tersimpan.

---

## 6. Perubahan Database

Tambahkan atau sesuaikan field pada tabel order/business plan sesuai struktur project.

Minimal field yang dibutuhkan:

```txt
orders / business_plans
- id
- order_code
- user_id
- customer_name
- customer_email
- plan_type
- payment_status
- generation_status
- business_input_json
- ai_result_json
- pdf_url
- error_message
- retry_count
- paid_at
- queued_at
- started_at
- completed_at
- failed_at
- email_sent_at
- created_at
- updated_at
```

Jika project memisahkan `orders` dan `business_plans`, maka:

- `orders` menyimpan status pembayaran.
- `business_plans` menyimpan status generate, hasil AI, dan PDF URL.

Contoh pembagian:

```txt
orders
- id
- order_code
- user_id
- payment_status
- amount
- plan_type
- paid_at
- created_at
- updated_at

business_plans
- id
- order_id
- generation_status
- business_input_json
- ai_result_json
- pdf_url
- error_message
- queued_at
- started_at
- completed_at
- failed_at
- email_sent_at
- created_at
- updated_at
```

---

## 7. Audit Log dan Generation Log

Tambahkan log agar admin/developer bisa melacak proses.

Opsional tapi disarankan:

```txt
generation_logs
- id
- order_id
- business_plan_id
- step_name
- status
- message
- metadata_json
- created_at
```

Contoh step yang dicatat:

```txt
payment_received
job_queued
pipeline_started
ai_generation_started
ai_generation_completed
pdf_render_started
pdf_render_completed
r2_upload_started
r2_upload_completed
email_send_started
email_send_completed
pipeline_completed
pipeline_failed
```

Tujuan:

- Memudahkan debugging.
- Memudahkan admin melihat proses gagal di bagian mana.
- Menjadi audit trail jika user sudah bayar tapi PDF gagal dibuat.

---

## 8. Struktur Folder yang Disarankan

Sesuaikan dengan struktur project yang sudah ada.

```txt
src/
  inngest/
    client.ts
    functions/
      generate-business-plan.ts
      regenerate-business-plan-pdf.ts

  app/
    api/
      inngest/
        route.ts
      webhooks/
        midtrans/
          route.ts
      orders/
        [orderId]/
          check-status/
            route.ts
      admin/
        orders/
          [orderId]/
            retry-generate/
              route.ts

  lib/
    ai/
      generate-business-plan-content.ts
    pdf/
      generate-basic-pdf.ts
      generate-premium-pdf.ts
    storage/
      r2.ts
    email/
      send-business-plan-email.ts
    orders/
      order-service.ts
    logs/
      generation-log-service.ts
```

---

## 9. Inngest Client

Buat singleton Inngest client.

```ts
// src/inngest/client.ts
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "bisnisapa-ai",
});
```

Ketentuan:

1. Gunakan application identifier `bisnisapa-ai`.
2. Client harus dapat digunakan untuk `send event` dan `createFunction`.
3. Jangan membuat banyak instance Inngest client di banyak file.
4. Gunakan satu module singleton.

---

## 10. Inngest Serve Route

Buat route untuk mendaftarkan function ke Inngest.

```ts
// src/app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { generateBusinessPlan } from "@/inngest/functions/generate-business-plan";
import { regenerateBusinessPlanPdf } from "@/inngest/functions/regenerate-business-plan-pdf";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateBusinessPlan,
    regenerateBusinessPlanPdf,
  ],
});
```

---

## 11. Event Inngest

Gunakan event yang spesifik terhadap business plan, bukan event terlalu umum seperti `payment/success`.

### Event Generate Awal

```txt
business-plan/generate.requested
```

Payload:

```ts
{
  orderId: string;
  businessPlanId: string;
  userId?: string;
  planType: "basic" | "premium";
  paymentId?: string;
  templateId?: string;
}
```

### Event Retry Full Generate

```txt
business-plan/generate.retry_requested
```

Payload:

```ts
{
  orderId: string;
  businessPlanId: string;
  requestedBy: "admin" | "system";
}
```

### Event Regenerate PDF Only

```txt
business-plan/pdf.regenerate_requested
```

Payload:

```ts
{
  orderId: string;
  businessPlanId: string;
  requestedBy: "admin" | "system";
}
```

Catatan:

- Untuk MVP, boleh hanya memakai satu event `business-plan/generate.requested`.
- Namun jika sudah ada fitur admin regenerate, sebaiknya pisahkan event retry full generate dan regenerate PDF only.

---

## 12. Webhook Midtrans

Webhook Midtrans tidak boleh menjalankan proses AI, PDF, upload R2, atau kirim email secara langsung.

Flow webhook:

```txt
1. Terima payload Midtrans
2. Validasi signature
3. Cek transaction_status
4. Jika settlement/capture:
   - cari order berdasarkan order_id
   - jalankan update dalam database transaction
   - payment_status = PAID
   - generation_status = QUEUED
   - paid_at = now()
   - queued_at = now()
   - kirim event ke Inngest
5. Return HTTP 200 secepat mungkin
```

Contoh pseudo-code:

```ts
export async function POST(req: Request) {
  const payload = await req.json();

  const isValid = verifyMidtransSignature(payload);

  if (!isValid) {
    return Response.json({ message: "Invalid signature" }, { status: 401 });
  }

  const transactionStatus = payload.transaction_status;

  if (transactionStatus !== "settlement" && transactionStatus !== "capture") {
    return Response.json({ received: true });
  }

  const order = await db.order.findUnique({
    where: { orderCode: payload.order_id },
    include: { businessPlan: true },
  });

  if (!order) {
    return Response.json({ message: "Order not found" }, { status: 404 });
  }

  // Idempotency check
  if (
    order.paymentStatus === "PAID" &&
    order.businessPlan?.generationStatus === "COMPLETED" &&
    order.businessPlan?.pdfUrl
  ) {
    return Response.json({ message: "Already processed" });
  }

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        paidAt: new Date(),
      },
    });

    await tx.businessPlan.update({
      where: { id: order.businessPlan.id },
      data: {
        generationStatus: "QUEUED",
        queuedAt: new Date(),
        errorMessage: null,
      },
    });
  });

  await inngest.send({
    name: "business-plan/generate.requested",
    data: {
      orderId: order.id,
      businessPlanId: order.businessPlan.id,
      userId: order.userId,
      planType: order.planType,
      paymentId: payload.transaction_id,
      templateId: order.businessPlan.templateId,
    },
  });

  return Response.json({ received: true, queued: true });
}
```

Ketentuan penting:

1. Webhook harus merespons cepat.
2. Webhook harus idempotent.
3. Webhook tidak boleh trigger proses generate langsung.
4. Webhook harus tetap aman jika Midtrans mengirim notifikasi lebih dari satu kali.
5. Webhook idealnya selesai dalam beberapa detik.

---

## 13. Pipeline Function Inngest

Buat function utama untuk menjalankan proses generate.

```ts
export const generateBusinessPlan = inngest.createFunction(
  {
    id: "generate-business-plan",
    name: "Generate Business Plan PDF",
    concurrency: {
      limit: 2,
    },
    retries: 3,
  },
  {
    event: "business-plan/generate.requested",
  },
  async ({ event, step }) => {
    // implementation
  }
);
```

Flow function:

```txt
1. Load order dan business plan
2. Validasi payment_status sudah PAID
3. Cek idempotency:
   - jika generation_status COMPLETED dan pdf_url ada, return early
   - jika sedang GENERATING, hindari concurrent duplicate process
4. Update generation_status = GENERATING dan started_at = now()
5. Generate AI business plan content
6. Simpan ai_result_json
7. Generate PDF berdasarkan plan_type
8. Upload PDF ke Cloudflare R2
9. Simpan pdf_url ke database
10. Kirim email ke user
11. Update generation_status = COMPLETED dan completed_at = now()
12. Jika gagal permanen, update generation_status = FAILED dan simpan error_message
```

Catatan penting:

- Status `GENERATING` harus diupdate sebelum proses AI dimulai.
- Jangan menunggu sampai AI selesai baru mengubah status.
- Ini agar admin dan user bisa melihat bahwa order sedang diproses.

---

## 14. Step-Level Workflow

Gunakan `step.run` untuk membagi workflow menjadi beberapa checkpoint.

Contoh pembagian step:

```txt
Step 1: load-and-validate-order
Step 2: mark-as-generating
Step 3: generate-ai-content
Step 4: save-ai-result
Step 5: render-pdf
Step 6: upload-pdf-to-r2
Step 7: save-pdf-url
Step 8: send-email
Step 9: mark-as-completed
```

Untuk menghemat execution Inngest, step ringan bisa digabung.

Versi lebih hemat:

```txt
Step 1: prepare-order
Step 2: generate-ai-content
Step 3: render-and-upload-pdf
Step 4: finalize-and-send-email
```

Rekomendasi MVP:

Gunakan step yang cukup jelas tapi tidak terlalu banyak.

```txt
Step 1: prepare-order
Step 2: generate-ai-content
Step 3: generate-and-upload-pdf
Step 4: send-email-and-complete
```

---

## 15. Retry Policy

Gunakan retry otomatis dari Inngest.

Rekomendasi:

```txt
AI generation      : max 3 retries
PDF rendering      : max 2 retries
R2 upload          : max 3 retries
Email delivery     : max 3 retries
```

Error yang boleh retry:

- OpenAI timeout
- AI provider rate limit sementara
- R2 upload gagal sementara
- Email provider timeout
- Database connection error sementara
- Network error

Error yang tidak perlu retry:

- Order tidak ditemukan
- Payment belum PAID
- Business plan tidak ditemukan
- Input user tidak valid
- Plan type tidak dikenali
- Template tidak tersedia

Gunakan error non-retriable untuk error permanen.

Contoh:

```ts
import { NonRetriableError } from "inngest";

if (!order) {
  throw new NonRetriableError("Order tidak ditemukan");
}

if (order.paymentStatus !== "PAID") {
  throw new NonRetriableError("Order belum dibayar");
}
```

---

## 16. Concurrency dan Throttling

Untuk MVP, batasi jumlah proses generate yang berjalan bersamaan.

Rekomendasi awal:

```ts
concurrency: {
  limit: 2,
}
```

Jika sudah stabil:

```ts
concurrency: {
  limit: 3,
}
```

Jika traffic mulai naik:

```ts
concurrency: {
  limit: 5,
},
throttle: {
  limit: 20,
  period: "1m",
}
```

Tujuan:

- Mencegah server/API kehabisan resource.
- Mencegah terlalu banyak request ke OpenAI dalam waktu bersamaan.
- Mencegah PDF renderer berjalan terlalu banyak secara paralel.
- Mencegah upload R2/email berjalan berlebihan.

---

## 17. Idempotency

Pipeline harus aman terhadap duplicate webhook, duplicate event, atau event replay.

Ketentuan:

1. Jika plan sudah `COMPLETED` dan `pdf_url` ada, function harus return early.
2. Jika plan sedang `GENERATING`, hindari proses duplicate.
3. Jika Midtrans mengirim webhook lebih dari sekali, jangan generate PDF/email berkali-kali.
4. Email tidak boleh dikirim dua kali tanpa kebutuhan jelas.
5. Admin retry harus eksplisit dan terkontrol.

Contoh pengecekan:

```ts
if (plan.generationStatus === "COMPLETED" && plan.pdfUrl) {
  return {
    status: "ALREADY_COMPLETED",
    pdfUrl: plan.pdfUrl,
  };
}

if (plan.generationStatus === "GENERATING") {
  return {
    status: "ALREADY_GENERATING",
  };
}
```

Untuk email:

```ts
if (!plan.emailSentAt) {
  await sendBusinessPlanEmail(...);
}
```

---

## 18. Error Handling

Jika proses gagal setelah retry:

```txt
- generation_status = FAILED
- error_message = pesan error singkat
- failed_at = now()
- buat generation log / audit log
```

Jangan tampilkan stack trace mentah ke user.

Untuk user:

```txt
Terjadi kendala saat membuat PDF. Silakan hubungi support.
```

Untuk admin:

```txt
Tampilkan error_message dan step yang gagal.
```

Jika memungkinkan, kirim notifikasi internal ke admin/support saat job gagal permanen.

---

## 19. Status Endpoint untuk User

Buat endpoint status yang hanya membaca database.

Route contoh:

```txt
GET /api/orders/[orderId]/check-status
```

Atau:

```txt
GET /api/orders/[orderCode]/status
```

Ketentuan:

1. Endpoint hanya membaca order dan generation status.
2. Endpoint tidak boleh trigger AI generation.
3. Endpoint tidak boleh trigger PDF rendering.
4. Endpoint tidak boleh mengirim event Inngest baru.
5. Endpoint mengembalikan `pdf_url` hanya jika status `COMPLETED`.

Contoh response:

```ts
{
  orderId: "string",
  orderCode: "string",
  paymentStatus: "PAID",
  generationStatus: "GENERATING",
  pdfUrl: null,
  message: "Rencana bisnis kamu sedang dibuat."
}
```

Jika selesai:

```ts
{
  orderId: "string",
  orderCode: "string",
  paymentStatus: "PAID",
  generationStatus: "COMPLETED",
  pdfUrl: "https://cdn.bisnisapa.id/report.pdf",
  message: "PDF kamu sudah siap diunduh."
}
```

---

## 20. Halaman Status User

Setelah pembayaran sukses, arahkan user ke halaman status.

Contoh route:

```txt
/order/[orderCode]/status
```

Tampilan berdasarkan status:

### QUEUED

```txt
Pembayaran berhasil.
Rencana bisnis kamu sudah masuk antrean dan akan segera dibuat.
```

### GENERATING

```txt
Rencana bisnis kamu sedang dibuat.
Mohon tunggu sebentar.
```

### COMPLETED

```txt
PDF rencana bisnis kamu sudah siap.
```

Tampilkan tombol:

```txt
Download PDF
```

### FAILED

```txt
Terjadi kendala saat membuat PDF.
Silakan hubungi support@bisnisapa.id.
```

Frontend boleh polling endpoint status secara berkala.

---

## 21. Admin Dashboard Monitoring

Admin harus bisa melihat status semua pesanan.

Halaman:

```txt
Admin > Orders
```

Card summary:

```txt
- Total Order
- Menunggu Pembayaran
- Dalam Queue
- Sedang Generate
- Selesai
- Gagal
```

Tabel order:

```txt
- Order Code
- Customer Name
- Customer Email
- Plan Type
- Payment Status
- Generation Status
- PDF URL
- Error Message
- Paid At
- Queued At
- Started At
- Completed At
- Action
```

Filter:

```txt
All
Pending Payment
Queued
Generating
Completed
Failed
```

Badge status:

```txt
PENDING    = abu-abu
QUEUED     = kuning
GENERATING = biru / ungu
COMPLETED  = hijau
FAILED     = merah
```

Action:

Jika `COMPLETED`:

```txt
- Lihat PDF
- Copy Link PDF
- Kirim Ulang Email
```

Jika `FAILED`:

```txt
- Lihat Error
- Retry Generate
```

Jika `QUEUED` atau `GENERATING`:

```txt
- Lihat Detail Proses
```

---

## 22. Admin Retry Generate

Tambahkan fitur admin untuk retry order yang gagal.

Route contoh:

```txt
POST /api/admin/orders/[orderId]/retry-generate
```

Ketentuan:

1. Hanya superadmin yang boleh mengakses.
2. Jika `payment_status` bukan `PAID`, retry harus ditolak.
3. Reset `error_message`.
4. Update `generation_status = QUEUED`.
5. Update `queued_at = now()`.
6. Kirim event ke Inngest.
7. Return response bahwa proses sudah masuk antrean.

Contoh event:

```ts
await inngest.send({
  name: "business-plan/generate.retry_requested",
  data: {
    orderId,
    businessPlanId,
    requestedBy: "admin",
  },
});
```

Untuk MVP, boleh gunakan event yang sama:

```ts
await inngest.send({
  name: "business-plan/generate.requested",
  data: {
    orderId,
    businessPlanId,
    retryByAdmin: true,
  },
});
```

---

## 23. Admin Regenerate PDF Only

Selain retry full generate, admin boleh memiliki fitur regenerate PDF only.

Tujuan:

- Jika AI result sudah benar tetapi PDF gagal dibuat.
- Jika template PDF diperbarui dan admin ingin membuat ulang PDF.
- Jika upload R2 gagal tetapi AI result sudah tersimpan.

Route contoh:

```txt
POST /api/admin/orders/[orderId]/regenerate-pdf
```

Flow:

```txt
1. Admin klik Regenerate PDF
2. Sistem cek order dan business plan
3. Jika ai_result_json sudah ada:
   - render PDF ulang
   - upload R2
   - update pdf_url
   - kirim ulang email jika diperlukan
4. Jika ai_result_json belum ada:
   - jalankan full generate ulang
```

Event:

```txt
business-plan/pdf.regenerate_requested
```

Payload:

```ts
{
  orderId: string;
  businessPlanId: string;
  requestedBy: "admin";
}
```

Catatan penting:

Regenerate PDF only tidak boleh memaksa generate AI ulang jika `ai_result_json` sudah ada.

Namun jika `ai_result_json` kosong, sistem harus otomatis fallback ke full generate.

---

## 24. Email Delivery

Email dikirim setelah PDF berhasil diupload dan `pdf_url` tersimpan.

Ketentuan:

1. Email dikirim ke customer email.
2. Email berisi link download PDF.
3. Simpan `email_sent_at` setelah email berhasil dikirim.
4. Jangan kirim email dua kali kecuali admin memilih kirim ulang.
5. Jika email gagal, sistem boleh retry.
6. Jika PDF sudah selesai tetapi email gagal, status bisa tetap `COMPLETED`, tetapi admin perlu melihat bahwa email belum terkirim.

Opsional field:

```txt
email_status
email_error_message
email_sent_at
```

Untuk MVP, cukup gunakan `email_sent_at`.

---

## 25. Cloudflare R2 Upload

PDF yang sudah dibuat harus diupload ke Cloudflare R2.

Ketentuan:

1. Gunakan nama file yang unik.
2. Simpan URL hasil upload di database.
3. Pastikan content type `application/pdf`.
4. Jangan overwrite file lama kecuali memang disengaja.
5. Jika regenerate PDF, boleh membuat file baru atau overwrite sesuai kebutuhan project.

Contoh nama file:

```txt
business-plans/{orderCode}-{businessPlanId}.pdf
```

Atau dengan timestamp:

```txt
business-plans/{orderCode}-{timestamp}.pdf
```

---

## 26. Graceful Fallback untuk Development

Requirement dari Claude menyebutkan fallback synchronous jika Inngest tidak dikonfigurasi. Fitur ini boleh dibuat, tetapi harus sangat dibatasi.

Rekomendasi yang lebih aman:

1. Di production, Inngest wajib dikonfigurasi.
2. Jangan pernah fallback synchronous di production.
3. Di development, utamakan menggunakan Inngest Dev Server.
4. Jika ingin synchronous fallback, aktifkan hanya melalui env eksplisit.

Env:

```env
ENABLE_SYNC_FALLBACK="false"
```

Ketentuan:

```txt
Jika NODE_ENV=development dan ENABLE_SYNC_FALLBACK=true:
- sistem boleh menjalankan pipeline secara synchronous untuk kebutuhan lokal

Jika NODE_ENV=production:
- sistem wajib memakai Inngest
- jika env Inngest tidak ada, return error konfigurasi
```

Jangan otomatis fallback hanya karena `INNGEST_EVENT_KEY` kosong.

Alasan:

- Agar local dan production tidak terlalu berbeda.
- Agar webhook tidak diam-diam menjadi berat.
- Agar developer sadar bahwa Inngest belum aktif.

---

## 27. Observability dan Monitoring

Tambahkan logging pada setiap step penting.

Minimal log:

```txt
- pipeline started
- AI generation started
- AI generation completed
- PDF render started
- PDF render completed
- R2 upload started
- R2 upload completed
- email send started
- email send completed
- pipeline completed
- pipeline failed
```

Log harus menyertakan:

```txt
- orderId
- businessPlanId
- stepName
- status
- errorMessage jika ada
- timestamp
```

Selain log internal, Inngest dashboard digunakan untuk melihat:

```txt
- function execution history
- success/failure status
- retry status
- durasi proses
- error pada step tertentu
```

Jika pipeline gagal permanen, buat audit log.

---

## 28. Environment Variable

Tambahkan env berikut atau sesuaikan dengan nama env yang sudah ada.

```env
# Inngest
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""

# Optional local fallback
ENABLE_SYNC_FALLBACK="false"

# App
APP_URL="https://bisnisapa.id"

# Midtrans
MIDTRANS_SERVER_KEY=""
MIDTRANS_CLIENT_KEY=""
MIDTRANS_IS_PRODUCTION="true"

# OpenAI / AI Provider
OPENAI_API_KEY=""

# Cloudflare R2
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""
R2_PUBLIC_URL=""

# Email
RESEND_API_KEY=""
SUPPORT_EMAIL="support@bisnisapa.id"
```

---

## 29. Acceptance Criteria Utama

### A. Inngest Integration

1. Inngest client dibuat sebagai singleton.
2. Inngest route `/api/inngest` tersedia.
3. Semua function pipeline terdaftar di route tersebut.
4. App identifier menggunakan `bisnisapa-ai`.

### B. Webhook Midtrans

1. Webhook memvalidasi signature Midtrans.
2. Webhook update payment status menjadi `PAID` ketika pembayaran sukses.
3. Webhook update generation status menjadi `QUEUED`.
4. Webhook mengirim event ke Inngest.
5. Webhook tidak menjalankan AI/PDF/upload/email secara langsung.
6. Webhook merespons HTTP 200 dengan cepat.
7. Webhook aman terhadap duplicate notification.

### C. Pipeline Function

1. Function menerima event dari Inngest.
2. Function memvalidasi order sudah dibayar.
3. Function melakukan idempotency check.
4. Function update status menjadi `GENERATING` sebelum generate AI.
5. Function generate AI content.
6. Function render PDF.
7. Function upload PDF ke R2.
8. Function simpan `pdf_url` ke database.
9. Function kirim email ke user.
10. Function update status menjadi `COMPLETED`.
11. Jika gagal permanen, function update status menjadi `FAILED`.

### D. Status Endpoint

1. Status endpoint hanya membaca database.
2. Status endpoint tidak memicu Inngest event.
3. Status endpoint tidak menjalankan generate AI/PDF.
4. Status endpoint mengembalikan payment status, generation status, message, dan pdf URL jika sudah selesai.

### E. Admin Dashboard

1. Admin bisa melihat daftar order.
2. Admin bisa filter berdasarkan generation status.
3. Admin bisa melihat order yang `QUEUED`, `GENERATING`, `COMPLETED`, dan `FAILED`.
4. Admin bisa melihat error jika order gagal.
5. Admin bisa retry order gagal.
6. Admin bisa melihat/copy link PDF jika sudah selesai.
7. Admin bisa kirim ulang email jika dibutuhkan.

### F. Retry dan Error Handling

1. Error sementara harus retry otomatis.
2. Error permanen tidak perlu retry terus menerus.
3. Error setelah retry maksimal harus disimpan ke database.
4. Admin bisa melakukan retry manual.
5. User tidak melihat stack trace error.

### G. Development dan Production

1. Production wajib memakai Inngest.
2. Production tidak boleh fallback synchronous.
3. Development boleh memakai Inngest Dev Server.
4. Synchronous fallback hanya boleh aktif jika `ENABLE_SYNC_FALLBACK=true`.

---

## 30. Prinsip Implementasi

1. Jangan merusak flow payment yang sudah ada.
2. Jangan ubah struktur besar aplikasi jika tidak perlu.
3. Gunakan naming yang konsisten.
4. Pisahkan logic AI, PDF, R2, email, dan order service.
5. Buat pipeline idempotent.
6. Simpan status penting ke database.
7. Admin dashboard membaca status dari database, bukan langsung dari Inngest.
8. Webhook Midtrans harus ringan dan cepat.
9. Jangan generate AI/PDF di webhook.
10. Jangan trigger generate dari status endpoint.
11. Gunakan retry untuk proses yang rawan gagal sementara.
12. Gunakan log dan audit trail untuk failure.
13. Batasi concurrency agar sistem tidak overload.

---

## 31. Ringkasan Implementasi MVP

Untuk MVP, cukup implementasikan bagian berikut:

```txt
1. Inngest client
2. Inngest serve route
3. Event business-plan/generate.requested
4. Update webhook Midtrans agar mengirim event ke Inngest
5. Pipeline generate AI → PDF → R2 → email
6. Status generation: PENDING, QUEUED, GENERATING, COMPLETED, FAILED
7. Status endpoint user
8. Admin order list dengan badge status
9. Admin retry generate untuk order FAILED
10. Logging sederhana
```

Fitur lanjutan yang bisa ditambahkan setelah MVP:

```txt
1. Regenerate PDF only
2. Kirim ulang email dari admin
3. Generation logs detail per step
4. Audit log lengkap
5. Internal notification ke admin saat job gagal
6. Scheduled cleanup PDF lama dari R2
7. Throttling lebih detail per paket Basic/Premium
8. Pisahkan queue Basic dan Premium
```

---

## 32. Output yang Diharapkan dari Implementasi

Tolong implementasikan fitur queue background job ini dengan rapi dan aman.

Pastikan hasil akhir mencakup:

1. Migration/schema update jika dibutuhkan.
2. Inngest client dan route.
3. Function background job untuk generate business plan.
4. Webhook Midtrans yang sudah decoupled.
5. Status endpoint read-only untuk user.
6. Admin dashboard dapat melihat status order.
7. Admin dapat retry order yang gagal.
8. Error handling dan idempotency.
9. Logging pada step penting.
10. Dokumentasi env yang dibutuhkan.

Prioritaskan implementasi yang stabil untuk MVP, bukan fitur yang terlalu kompleks.
