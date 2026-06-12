# Backend Documentation — BisnisApa.id

## Overview

Backend BisnisApa.id dibangun sebagai Next.js API Routes (App Router) dengan arsitektur layered:

```
API Route → Service Layer → Repository (Prisma) → PostgreSQL
                ↓
          Inngest queue (background jobs)
```

Semua business logic ada di `src/server/`, API routes hanya bertanggung jawab untuk parsing request, auth guard, rate limiting, dan formatting response. Proses berat post-payment (AI plan generation, PDF render, R2 upload, email) dijalankan di background lewat **Inngest** supaya webhook Midtrans tetap ringan dan tidak timeout.

---

## Database

### Provider
- **PostgreSQL** via Neon (serverless)
- **ORM:** Prisma 6 dengan `@prisma/adapter-pg` (driver adapter)
- **Connection:** Pooler URL (`DATABASE_URL`) + Direct URL (`DIRECT_URL`) untuk migrations

### Schema (`prisma/schema.prisma`)

**Models utama:**

| Model | Fungsi |
|-------|--------|
| `User` | Admin users (SUPERADMIN role) |
| `BusinessPlan` | Menyimpan wizard input, rekomendasi, AI plan, financial projection, PDF URL |
| `Order` | Transaksi pembayaran (Midtrans), status lifecycle, email delivery state |
| `AuditLog` | Riwayat semua aksi penting (login, payment, generate, dll) |
| `SupportTicket` | Tiket support dari inbound email |
| `SupportMessage` | Pesan dalam tiket (dari user atau admin reply) |

**Enums:**
- `UserRole`: USER, SUPERADMIN
- `PlanStatus`: DRAFT → RECOMMENDED → SELECTED → GENERATED → PAID → GENERATING → PDF_READY / FAILED
- `OrderStatus`: PENDING → SUCCESS / FAILED / EXPIRED / CANCELED
- `AuditAction`: 20+ action types untuk audit trail

**Plan status lifecycle setelah pembayaran:**

```
PAID         ← webhook menerima settlement, plan masuk antrean
  ↓
GENERATING   ← Inngest function mulai eksekusi (mark sebelum AI dipanggil)
  ↓
PDF_READY    ← AI selesai + PDF render + R2 upload + email terkirim
  
FAILED       ← retry exhausted, admin bisa retry manual dari dashboard
```

### Seed

```bash
npm run db:seed    # Buat superadmin dari SUPERADMIN_EMAIL + SUPERADMIN_PASSWORD di .env
```

---

## API Endpoints

### Response Format

Semua endpoint menggunakan format konsisten:

```json
// Success
{ "success": true, "message": "OK", "data": { ... } }

// Error
{ "success": false, "message": "Error description", "errors": { ... } }
```

### Public Endpoints

| Method | Path | Rate Limit | Fungsi |
|--------|------|-----------|--------|
| POST | `/api/planner/recommend` | 5/30min/IP | Generate 4 rekomendasi bisnis via AI (sync, `maxDuration=120s`, hasil di-cache 24h via Upstash Redis) |
| POST | `/api/planner/select-idea` | 10/30min/IP | Pilih ide → hitung finansial + generate AI plan (sync, `maxDuration=180s`) |
| GET | `/api/planner/preview/[planId]` | — | Preview business plan (financial + AI narrative) |
| POST | `/api/orders/create-payment` | 10/10min/IP | Buat order + Midtrans payment token |
| GET | `/api/orders/[orderId]` | — | Get order detail (public, untuk polling status) |
| GET | `/api/orders/[orderId]/check-status` | — | Check + sync status dari Midtrans |
| GET | `/api/pdf/download/[planId]` | — | Download PDF (cek order SUCCESS dulu) |
| GET | `/api/sample-pdf` | — | Sample PDF untuk landing page (cached 24h) |

### Webhook Endpoints

| Method | Path | Security | Fungsi |
|--------|------|---------|--------|
| POST | `/api/payments/midtrans/webhook` | SHA-512 signature | Payment notification dari Midtrans |
| POST | `/api/webhooks/resend/receive` | Svix HMAC-SHA256 | Inbound email dari Resend |

### Inngest Background Queue

| Method | Path | Security | Fungsi |
|--------|------|---------|--------|
| GET | `/api/inngest` | `INNGEST_SIGNING_KEY` (cloud mode) | Discovery endpoint — Inngest menemukan function yang terdaftar |
| POST | `/api/inngest` | Inngest signature header | Function invocation — dipanggil per-step oleh Inngest |
| PUT | `/api/inngest` | `INNGEST_SIGNING_KEY` | Sync registration dari Inngest CLI / dashboard |

Endpoint ini di-config dengan `maxDuration = 300` (5 menit) supaya step terlama (AI generation 30-90s, PDF render 5-30s) muat di Vercel Pro. `runtime = "nodejs"` eksplisit karena `@react-pdf/renderer` + Prisma + AWS SDK tidak kompatibel dengan Edge runtime.

Di production, `GET /api/inngest` dari browser akan return `401 {"message": "Unauthorized"}` — itu normal. Endpoint hanya menerima request yang signed oleh Inngest.

### Admin Endpoints (require SUPERADMIN session)

| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/api/admin/overview` | Dashboard metrics |
| GET | `/api/admin/orders` | List orders (paginated, filterable) |
| GET | `/api/admin/orders/[orderId]` | Order detail + audit logs |
| POST | `/api/admin/orders/[orderId]/resend-email` | Kirim ulang email PDF |
| POST | `/api/admin/orders/[orderId]/retry-generate` | Re-queue full pipeline (AI → PDF → email) ke Inngest |
| POST | `/api/admin/orders/[orderId]/regenerate-pdf` | Re-render PDF only (skip AI jika `aiPlanJson` sudah ada) |
| GET | `/api/admin/plans` | List plans (paginated, filterable) |
| GET | `/api/admin/plans/[planId]` | Plan detail |
| GET | `/api/admin/logs` | Audit logs (paginated, filterable) |
| GET | `/api/admin/settings` | Get system settings |
| PUT | `/api/admin/settings` | Update settings |
| POST | `/api/admin/pdf-test` | Generate test PDF (mockup data) |
| GET | `/api/admin/storage` | List R2 storage files |
| DELETE | `/api/admin/storage` | Bulk delete storage files |
| POST | `/api/admin/change-password` | Ubah password admin |
| GET/POST | `/api/admin/support-tickets` | Support ticket management |
| POST | `/api/pdf/generate/[planId]` | Regenerate PDF + auto email (admin only) |

---

## Services (`src/server/`)

### AI Service (`server/ai/`)

| File | Fungsi |
|------|--------|
| `client.ts` | OpenAI client wrapper, model selection, JSON extraction |
| `prompts.ts` | System prompts untuk rekomendasi dan plan generation |
| `plan-prompt-builder.ts` | Build prompt dari wizard data + financial projection |
| `schemas.ts` | Zod schemas untuk AI response validation |
| `web-research.ts` | Web search via OpenAI Responses API untuk data pasar aktual |

**Model yang digunakan:**
- `gpt-5` (reasoning model) — untuk rekomendasi bisnis. Tanpa `temperature`, pakai `max_completion_tokens: 25000+`
- `gpt-5.4-mini` — untuk generate business plan narrative

**Margin rules per kategori:**
- F&B: 15-35%
- Reseller: 10-25%
- Jasa: 30-50%
- Digital: 50-80%
- Retail: 5-15%

### Business Service (`server/business/`)

| File | Fungsi |
|------|--------|
| `templates.ts` | 21 template bisnis internal (data referensi) |
| `calculator.ts` | Hitung financial projection dari template data |
| `matcher.ts` | Match wizard input ke template yang relevan |
| `recommendation.service.ts` | Orchestrate: match → AI enhance → return 4 rekomendasi |
| `plan.service.ts` | Generate full business plan (AI + web research + financial) |

### Payment Service (`server/payment/`)

| File | Fungsi |
|------|--------|
| `midtrans.client.ts` | Midtrans Snap API wrapper |
| `payment.service.ts` | Create order, handle webhook, verify signature |

**Payment flow:**
1. Frontend POST `/api/orders/create-payment` → backend buat order + Midtrans token
2. User redirect ke Midtrans payment page
3. Midtrans POST webhook → verify SHA-512 signature → update order status
4. Jika SUCCESS: set `BusinessPlan.status = PAID` lalu **dispatch event ke Inngest** (`business-plan/generate.requested`). Webhook langsung return 200 — proses berat dijalankan asynchronous.
5. Frontend poll `/api/orders/[orderId]/check-status` untuk update UI
6. Inngest function eksekusi pipeline: AI plan → PDF render → R2 upload → email send (lihat bagian "Background Queue" di bawah).

**Security:**
- Signature verification: SHA-512(`order_id` + `status_code` + `gross_amount` + `server_key`)
- Webhook idempotent: second SUCCESS payload tidak trigger ulang
- QRIS only di production, QRIS + BCA VA di development
- `maxDuration = 10` di webhook route — webhook hanya boleh ringan

### Caching (`server/cache/`)

| File | Fungsi |
|------|--------|
| `redis-cache.ts` | Lightweight Upstash Redis cache helper (`cacheGet`, `cacheSet`, `makeCacheKey`) — fallback no-op kalau Upstash tidak dikonfigurasi |

**Yang di-cache:**

| Use case | Key prefix | TTL | Tujuan |
|---|---|---|---|
| AI recommendations | `ai-recommendations:v1` | 24 jam | Hindari OpenAI call duplicate untuk input wizard yang sama (Bandung, F&B, 3-5 juta, dll) — hemat token + lebih cepat saat traffic tinggi |

Cache key dibangun dari `userInput` + ID template top-5 yang match. Dua user dengan input identik akan berbagi cache yang sama. `BusinessPlan` tetap dibuat baru per request (yang di-cache hanya **hasil AI**).

### Background Queue — Inngest (`src/inngest/`)

Inngest digunakan untuk menjalankan pipeline post-payment (AI plan → PDF render → R2 upload → email) secara asynchronous dengan retry, idempotency, dan observability bawaan.

| File | Fungsi |
|------|--------|
| `client.ts` | Singleton Inngest client (`id: "bisnisapa-ai"`) + helper flag `isInngestConfigured` & `isSyncFallbackAllowed` |
| `dispatcher.ts` | `dispatchGenerateBusinessPlan()` & `dispatchRegeneratePdf()` — wrapper yang memutuskan: queue ke Inngest, fallback synchronous (dev only), atau throw kalau prod tanpa key |
| `functions/generate-business-plan.ts` | Dua function: `generateBusinessPlan` (full pipeline) + `regenerateBusinessPlanPdf` (PDF only) |

**Events:**

| Event Name | Dispatcher | Pemicu |
|---|---|---|
| `business-plan/generate.requested` | webhook Midtrans, admin retry, check-status fallback | Pembayaran sukses → jalankan full pipeline |
| `business-plan/pdf.regenerate_requested` | admin regenerate PDF | Re-render PDF saja (skip AI kalau `aiPlanJson` ada) |

**Pipeline steps (`generateBusinessPlan`):**

```
Step 1  prepare-order
        - Validate order SUCCESS
        - Idempotency: skip kalau plan PDF_READY atau GENERATING
        - Update plan.status = GENERATING

Step 2  generate-ai-content
        - ensurePlanGeneratedForOrder() → AI plan + financial projection
        - Idempotent: kalau aiPlanJson sudah ada, skip generate baru

Step 3  generate-and-upload-pdf
        - Render PDF via @react-pdf/renderer
        - Upload buffer ke Cloudflare R2
        - Update plan.status = PDF_READY + plan.pdfUrl

Step 4  send-email-and-complete
        - Resend email berisi link download PDF
        - Best-effort: failure di sini tidak fail-kan pipeline
```

**Retry & error handling:**
- Function-level: `retries: 3` (full generate), `retries: 2` (regenerate PDF)
- `NonRetriableError` dipakai untuk error permanen: order tidak ditemukan, payment belum SUCCESS, plan tidak terkait order.
- `onFailure` hook: setelah semua retry habis, plan otomatis di-set ke `FAILED` supaya admin bisa retry manual dari dashboard.
- Per-step retry default Inngest tetap berlaku → step yang gagal sementara (OpenAI timeout, R2 503, dll) di-retry otomatis tanpa mengulang step yang sudah sukses.

**Concurrency & throttling:**
- `concurrency.limit = 10` — maks 10 pipeline run paralel (aman untuk OpenAI Tier 2+ dan Vercel Pro 1024MB).
- `throttle = 30/menit` — burst smoothing supaya 100 webhook masuk barengan tidak langsung membanjiri OpenAI.
- Idempotency check di `prepare-order` mencegah duplicate run kalau event masuk dua kali.
- Untuk OpenAI Tier 1 (≤200 RPM), turunkan concurrency ke 5. Untuk Tier 3+ dengan traffic konsisten, naikkan ke 20.

**Mode operasi:**

| Kondisi | Behavior |
|---|---|
| Production + `INNGEST_EVENT_KEY` set | Dispatch ke Inngest Cloud (REQUIRED) |
| Development + `INNGEST_EVENT_KEY` kosong | Dispatch ke Inngest Dev Server lokal (`npx inngest-cli@latest dev`) |
| Development + `ENABLE_SYNC_FALLBACK=true` | Pipeline dijalankan synchronous langsung di webhook (escape hatch dev only) |
| Production tanpa `INNGEST_EVENT_KEY` | Dispatcher throw `INNGEST_NOT_CONFIGURED` — fail fast supaya bug tidak silent |

**Local development:**

```bash
# Terminal 1
npm run dev

# Terminal 2 — Inngest Dev Server (UI di localhost:8288)
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

Pastikan tab **Apps** di `localhost:8288` menampilkan `bisnisapa-ai` dengan status Synced — kalau kosong, event akan masuk tapi tidak ada konsumer.

**Production deployment:**

1. Set `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` di Vercel env (production environment).
2. Deploy.
3. Daftarkan app di Inngest dashboard → Apps → **Sync new app** → URL `https://bisnisapa.id/api/inngest`.
4. Setelah sync sukses, status app harus `Active` dan kedua function muncul.
5. Setiap deploy berikutnya yang mengubah definisi function (id, retries, trigger), perlu **Resync** manual atau pakai Vercel deploy hook + Inngest auto-sync integration.

**Observability:**
- Inngest dashboard menampilkan: function runs, step-by-step input/output, retry count, durasi, dan error stack.
- App logger (`logger.info`/`logger.error`) tetap ditulis ke Vercel logs di setiap step.
- Plan status di DB jadi single source of truth untuk UI (admin dashboard, status endpoint user).

### PDF Service (`server/pdf/`)

| File | Fungsi |
|------|--------|
| `pdf.service.ts` | Orchestrate: fetch plan → render PDF → store → return URL |
| `react-pdf-template.tsx` | React PDF components (Basic 4 pages, Premium 10 pages) |
| `storage.service.ts` | Upload ke R2/S3 atau local filesystem |
| `logo-base64.ts` | Logo embedded sebagai base64 (Vercel tidak punya public/ at runtime) |

**Storage:**
- Production: Cloudflare R2 (`S3_REGION="auto"`, `forcePathStyle: true`)
- Development: Local filesystem (`public/generated-pdfs/`)
- URL format: `s3://bucket/pdfs/planId.pdf` → served via download route

### Email Service (`server/email/`)

| File | Fungsi |
|------|--------|
| `email.service.ts` | Send PDF report email, handle dev/prod mode |
| `resend.client.ts` | Lazy-init Resend SDK |
| `templates.ts` | HTML email templates (plain HTML, no React Email) |

**Email modes:**
- Development: sender `onboarding@resend.dev`, recipient = actual customer email
- Production: sender dari `RESEND_FROM_EMAIL` (verified domain)

### Auth (`server/auth/`)

| File | Fungsi |
|------|--------|
| `guard.ts` | `requireSuperadmin()` — throws 401/403 |
| `password.ts` | bcrypt hash utility |
| `seed-superadmin.ts` | Create admin user from env vars |

### Rate Limiting (`server/rate-limit/`)

| Limiter | Config | Digunakan di |
|---------|--------|-------------|
| `aiGenerateLimiter` | 5 req / 30 min | `/api/planner/recommend`, PDF regenerate |
| `selectIdeaLimiter` | 10 req / 30 min | `/api/planner/select-idea` |
| `paymentLimiter` | 10 req / 10 min | `/api/orders/create-payment` |
| `webhookLimiter` | 60 req / 10 min | Midtrans webhook, Resend webhook |
| `authLimiter` | 10 req / 10 min | Login, change password |

**IP extraction priority (anti-spoofing):**
1. `x-vercel-forwarded-for` (platform-injected, cannot be spoofed)
2. `cf-connecting-ip` (Cloudflare)
3. `x-real-ip` (trusted proxy)
4. `x-forwarded-for` (fallback)

---

## Security

### Authentication
- Auth.js v5 dengan JWT strategy
- Credentials provider (email + password)
- Session berisi `id`, `email`, `name`, `role`
- Admin routes dilindungi `requireSuperadmin()` di setiap endpoint

### Webhook Verification
- **Midtrans:** SHA-512 signature verification
- **Resend:** Svix HMAC-SHA256 signature (wajib di production via `RESEND_WEBHOOK_SECRET`)

### SSL
- Database connection menggunakan `sslmode=verify-full` (explicit, bukan alias)

### Rate Limiting
- Upstash Redis sliding window
- Fallback no-op di development (tanpa Redis)
- Applied ke: login, AI generation, payment, webhooks, password change

### CORS & Headers
- Security headers dikonfigurasi via `next.config.ts`
- CSP, X-Frame-Options, Referrer-Policy, dll

---

## Environment Variables

```bash
# App
APP_URL="https://bisnisapa.id"
NODE_ENV="production"

# Database (Neon)
DATABASE_URL="postgresql://..."          # Pooler URL
DIRECT_URL="postgresql://..."            # Direct URL (migrations)

# Auth
AUTH_SECRET="random-32-char-string"
SUPERADMIN_EMAIL="admin@bisnisapa.id"
SUPERADMIN_PASSWORD="secure-password"

# AI
OPENAI_API_KEY="sk-..."
AI_PROVIDER="openai"
AI_RECOMMENDATION_MODEL="gpt-5"
AI_PLAN_MODEL="gpt-5.4-mini"

# Payment (Midtrans)
MIDTRANS_SERVER_KEY="..."
MIDTRANS_CLIENT_KEY="..."
MIDTRANS_IS_PRODUCTION="true"

# Storage (Cloudflare R2)
PDF_STORAGE_DRIVER="s3"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_BUCKET="bisnisapa-pdfs"
S3_REGION="auto"
S3_ENDPOINT="https://xxx.r2.cloudflarestorage.com"

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="BisnisApa.id <noreply@bisnisapa.id>"
RESEND_WEBHOOK_SECRET="whsec_..."
EMAIL_DEV_MODE="false"                   # set true di dev untuk paksa onboarding@resend.dev sender

# Inngest (background queue)
INNGEST_EVENT_KEY="..."                  # WAJIB di production
INNGEST_SIGNING_KEY="signkey-prod-..."   # WAJIB di production
ENABLE_SYNC_FALLBACK="false"             # MUST be false di production

# Rate Limit (Upstash)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

---

## Deployment

### Vercel

1. Connect repo ke Vercel
2. Set semua environment variables
3. Build command: `npm run build` (auto-detected)
4. Framework preset: Next.js

### Database (Neon)

1. Create project di Neon
2. Copy pooler URL → `DATABASE_URL`
3. Copy direct URL → `DIRECT_URL`
4. Run: `npx prisma db push` lalu `npm run db:seed`

### Cloudflare R2

1. Create bucket di Cloudflare dashboard
2. Create API token (R2 read/write)
3. Set `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`
4. `S3_REGION` harus `"auto"` (bukan region AWS)

### Midtrans

1. Daftar di Midtrans sandbox/production
2. Set server key + client key
3. Set webhook URL: `https://bisnisapa.id/api/payments/midtrans/webhook`
4. Set redirect URLs di env

### Resend

1. Verify domain di Resend dashboard
2. Set `RESEND_API_KEY` dan `RESEND_FROM_EMAIL`
3. Create webhook → URL: `https://bisnisapa.id/api/webhooks/resend/receive`
4. Copy signing secret → `RESEND_WEBHOOK_SECRET`

### Inngest

1. Daftar / login di [app.inngest.com](https://app.inngest.com).
2. Pastikan toggle environment di dashboard **Production** sebelum copy keys.
3. **Manage** → **Event Keys** → copy → set ke env Vercel: `INNGEST_EVENT_KEY`.
4. **Manage** → **Signing Keys** → copy → set ke env Vercel: `INNGEST_SIGNING_KEY`.
5. Set `ENABLE_SYNC_FALLBACK="false"` di Vercel.
6. Redeploy supaya env aktif.
7. **Apps** → **Sync new app** → URL: `https://bisnisapa.id/api/inngest`.
8. Verifikasi app status `Active` dan function `generate-business-plan` + `regenerate-business-plan-pdf` muncul.
9. (Opsional) Setup Vercel Deploy Hook + Inngest auto-sync integration supaya tiap deploy berikutnya tidak perlu resync manual.

**Catatan**: kalau Vercel **Deployment Protection** aktif, tambahkan path `/api/inngest` ke bypass list — kalau tidak, Inngest akan kena Vercel SSO login wall sebelum sampai ke handler dan sync gagal.
