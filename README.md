# BisnisApa.id

> **Idea to Business** — Platform AI yang membantu pengguna menemukan ide bisnis dan menyusun rencana bisnis awal berdasarkan modal, lokasi, minat, dan target pasar.

---

## Apa Ini?

BisnisApa.id adalah SaaS platform berbasis AI yang dirancang untuk pemula bisnis di Indonesia. Pengguna menjawab beberapa pertanyaan sederhana, lalu sistem memberikan rekomendasi ide bisnis yang realistis lengkap dengan estimasi modal, margin, dan business plan dalam format PDF.

**Target pengguna:** Mahasiswa, pekerja, ibu rumah tangga, dan siapa pun yang ingin memulai bisnis tapi bingung harus mulai dari mana.

## Produk

| Paket | Harga | Output |
|-------|-------|--------|
| Free | Rp0 | 4 rekomendasi ide bisnis dengan estimasi modal dan margin |
| Basic | Rp49.000 | PDF business plan ringkas (~4 halaman) |
| Premium | Rp99.000 | PDF business plan lengkap (~10 halaman) dengan HPP, skenario, marketing plan |

## Flow Utama

```
┌─────────────────────────────────────────────────────────────────────┐
│  USER JOURNEY                                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Landing Page                                                     │
│     └─ User klik "Mulai Cari Ide Bisnis"                            │
│                                                                      │
│  2. Wizard (9 langkah)                                               │
│     └─ Modal → Lokasi → Area → Kategori → Model Jualan              │
│     └─ Waktu → Aset → Target Income → Risiko → Margin               │
│                                                                      │
│  3. AI Recommendation                                                │
│     └─ Sistem generate 4 rekomendasi ide bisnis                      │
│     └─ Masing-masing dengan skor kecocokan, modal, margin            │
│                                                                      │
│  4. Pilih Ide + Pilih Paket                                          │
│     └─ User pilih ide terbaik                                        │
│     └─ Pilih paket (Basic/Premium) + isi email                       │
│                                                                      │
│  5. Payment (Midtrans)                                               │
│     └─ QRIS (production) / QRIS + BCA VA (development)              │
│     └─ Redirect ke halaman status                                    │
│                                                                      │
│  6. Post-Payment                                                     │
│     └─ Webhook Midtrans → update status → generate AI plan           │
│     └─ Render PDF → upload ke R2 → kirim email ke customer           │
│                                                                      │
│  7. Download PDF                                                     │
│     └─ User bisa download dari halaman success atau link email       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) + React 19 + TypeScript |
| Database | PostgreSQL (Neon) + Prisma 6 |
| Auth | Auth.js v5 (Credentials Provider) |
| AI | OpenAI (gpt-5.4-mini untuk plan, gpt-5 untuk rekomendasi) |
| Payment | Midtrans Snap Redirect |
| PDF | @react-pdf/renderer (serverless-friendly) |
| Storage | Cloudflare R2 (S3-compatible) |
| Email | Resend |
| Rate Limit | Upstash Redis + @upstash/ratelimit |
| Frontend | Tailwind CSS v4, TanStack Query/Table, Framer Motion, GSAP |
| Font | Geist Sans |
| Deployment | Vercel |

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Isi: DATABASE_URL, AUTH_SECRET, OPENAI_API_KEY, MIDTRANS_*, dll

# Setup database
npx prisma db push
npm run db:seed          # Buat superadmin dari env

# Development
npm run dev              # http://localhost:3000

# Production build
npm run build
npm start
```

## Environment Variables

Lihat `.env.example` untuk daftar lengkap. Yang wajib:

| Variable | Keterangan |
|----------|-----------|
| `DATABASE_URL` | PostgreSQL connection string (Neon pooler) |
| `AUTH_SECRET` | Random string min 16 karakter |
| `OPENAI_API_KEY` | API key OpenAI |
| `MIDTRANS_SERVER_KEY` | Server key Midtrans |
| `MIDTRANS_CLIENT_KEY` | Client key Midtrans |

## Dokumentasi Teknis

- **Backend:** [`docs/backend.md`](docs/backend.md) — API endpoints, services, database schema, security
- **Frontend:** [`docs/frontend.md`](docs/frontend.md) — Pages, components, state management, design system
- **Design System:** [`docs/bisnisapa-design-system-navbar-updated.md`](docs/bisnisapa-design-system-navbar-updated.md)

## Struktur Folder

```
src/
├─ app/                    # Next.js routes (pages + API)
├─ components/             # UI primitives + shared + landing + layout
├─ features/               # Domain modules (planner, payment, admin)
├─ server/                 # Backend logic (auth, ai, business, pdf, email, payment)
├─ lib/                    # Utilities (prisma, query-client, format, env)
└─ auth.ts                 # Auth.js configuration
```

## Admin Dashboard

Akses: `/dashboard` (login required, role SUPERADMIN)

Fitur:
- Overview metrics + charts (revenue, orders, conversion)
- Order management (list, detail, resend email)
- Plan management (list, detail, regenerate PDF)
- Storage browser (R2 file management, bulk delete)
- Audit logs
- Support tickets
- PDF template testing
- Settings
- Change password

## License

Private — All rights reserved.
