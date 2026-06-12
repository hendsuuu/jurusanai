# Frontend Documentation — BisnisApa.id

## Overview

Frontend BisnisApa.id dibangun dengan Next.js 16 App Router, React 19, dan TypeScript strict. Arsitektur mengikuti feature-based structure dengan pemisahan jelas antara UI components, domain logic, dan state management.

---

## Tech Stack

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Next.js | 16.2.6 | Framework (App Router, Turbopack) |
| React | 19.2.4 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling (token-based via `@theme`) |
| TanStack Query | 5.x | Server state management + caching |
| TanStack Table | 8.x | Data tables (admin) |
| Framer Motion | 12.x | Animations |
| GSAP | 3.x | Advanced animations (CardSwap) |
| Lucide React | 1.x | Icons |
| Sonner | 2.x | Toast notifications |
| class-variance-authority | 0.7 | Component variants |

---

## Design System

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Brand Blue | `#2563FF` | Hero, footer, CTA, active states |
| Brand Blue Dark | `#1746C7` | Hover, gradient end |
| CTA Yellow | `#FFB020` | Primary CTA on blue backgrounds |
| Neutral Heading | `#0F172A` | Headings on white |
| Neutral Body | `#475569` | Body text |

### Typography

- **Primary font:** Geist Sans (via `next/font/google`)
- **Fallback:** Manrope, Inter, system-ui, sans-serif
- **Hero heading:** 42-68px, weight 800
- **Section heading:** 30-44px, weight 800
- **Body:** 15-16px, weight 400

### Component Primitives (`src/components/ui/`)

| Component | File | Variants |
|-----------|------|----------|
| Button | `button.tsx` | primary, secondary, ghost, outline, danger, link × sm, md, lg, icon |
| Card | `card.tsx` | CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| Badge | `badge.tsx` | neutral, brand, blue, success, warning, danger, info, outline |
| Input | `input.tsx` | Standard with focus ring |
| Label | `label.tsx` | Standard |
| Select | `select.tsx` | Native select styled |
| Skeleton | `skeleton.tsx` | Loading placeholder |
| Container | `container.tsx` | default, narrow, wide |

---

## Pages

### Public Pages

| Path | Type | Komponen Utama |
|------|------|---------------|
| `/` | Static | Hero, HowItWorks, ExampleOutput, MagicBento, PricingTeaser, TestimonialMarquee, Faq, CtaSection |
| `/examples` | Static | Template bisnis grid dengan stats |
| `/planner` | Client | PlannerWizard (9 steps) |
| `/planner/recommendations` | Client | RecommendationsView (4 cards) |
| `/planner/preview/[planId]` | Client | PlanPreview + PricingModal |
| `/payment/redirect/[orderId]` | Client | PaymentStatusView (polling) |
| `/payment/success/[orderId]` | Server+Client | PaymentSuccessView (server prefetch + polling) |
| `/payment/failed/[orderId]` | Client | PaymentFailedView |
| `/login` | Server | Login form |

### Admin Pages (`/dashboard/*`)

| Path | Komponen | Data Source |
|------|----------|-------------|
| `/dashboard` | OverviewView | `useAdminOverview()` |
| `/dashboard/orders` | AdminOrderTable | `useAdminOrders()` |
| `/dashboard/orders/[orderId]` | OrderDetailView | `useAdminOrderDetail()` |
| `/dashboard/plans` | AdminPlanTable | `useAdminPlans()` |
| `/dashboard/plans/[planId]` | PlanDetailView | `useAdminPlanDetail()` |
| `/dashboard/storage` | StorageBrowserView | Custom `useQuery` |
| `/dashboard/support-tickets` | SupportTicketList | Custom `useQuery` |
| `/dashboard/support-tickets/[id]` | SupportTicketDetailView | Custom `useQuery` |
| `/dashboard/logs` | AdminLogTable | `useAdminLogs()` |
| `/dashboard/settings` | AdminSettingsView | Custom `useQuery` |
| `/dashboard/pdf-test` | PdfTestPage | Direct fetch (one-shot) |

---

## State Management

### TanStack Query

**Global defaults** (`src/lib/query-client.ts`):
- `staleTime`: 2 minutes — data dianggap fresh selama 2 menit
- `gcTime`: 10 minutes — cache disimpan 10 menit setelah terakhir digunakan
- `refetchOnWindowFocus`: false
- `refetchOnMount`: false — gunakan cache saat navigasi back
- `refetchOnReconnect`: false

**Query key structure:**
```typescript
queryKeys = {
  planner: { preview: (planId) => ["planner", "preview", planId] },
  orders: { detail: (orderId) => ["orders", "detail", orderId] },
  admin: {
    overview: ["admin", "overview"],
    orders: (params) => ["admin", "orders", params],
    orderDetail: (orderId) => ["admin", "orders", "detail", orderId],
    plans: (params) => ["admin", "plans", params],
    planDetail: (planId) => ["admin", "plans", "detail", planId],
    logs: (params) => ["admin", "logs", params],
  },
}
```

**Invalidation strategy:**
- Mutations invalidate related queries (e.g. PDF regenerate → invalidate plan detail + plan list + order list)
- Order detail uses `refetchOnMount: "always"` + conditional polling (5s interval while pipeline running, stops once `PDF_READY`/`FAILED` and email is final)
- Admin list pages use URL search params for pagination/filter state
- Admin pipeline actions (`useRetryOrderGenerate`, `useRegenerateOrderPdf`) invalidate order detail + orders list so the new pipeline run shows up immediately after dispatch

### Local State

- **Wizard draft:** `usePlannerDraft()` hook — persists wizard answers to localStorage, auto-hydrates on mount
- **URL params:** `useSearchParamsState()` hook — syncs filter/pagination state with URL for shareable links

---

## Feature Modules (`src/features/`)

### Planner (`features/planner/`)

```
planner/
├─ api/              # API client functions
├─ components/
│  ├─ planner-wizard.tsx        # Main wizard orchestrator
│  ├─ wizard-progress.tsx       # Progress bar (yellow on blue)
│  ├─ wizard-step-shell.tsx     # Step title + hint wrapper
│  ├─ wizard-navigation.tsx     # Back/Next buttons (yellow CTA)
│  ├─ option-card.tsx           # Selectable option (glassmorphism on blue)
│  ├─ recommendation-loading.tsx # Full-screen loading with rotating quotes
│  ├─ recommendations-view.tsx  # 4 recommendation cards
│  ├─ recommendation-card.tsx   # Individual recommendation
│  ├─ plan-preview.tsx          # Business plan preview
│  └─ locked-pdf-preview.tsx    # Locked sections teaser
├─ hooks/
│  ├─ use-planner-draft.ts     # localStorage persistence
│  └─ use-planner-mutations.ts # TanStack mutations
├─ schemas/          # Zod validation schemas
├─ constants/        # Wizard step options
└─ types/
```

**Wizard UX:**
- Full blue brand gradient background (`#2563FF → #1746C7`)
- White text, yellow `#FFB020` CTA buttons
- Option cards use glassmorphism (`bg-white/8`, `border-white/20`)
- Selected state: yellow border + indicator
- Smooth step transitions via Framer Motion AnimatePresence

### Payment (`features/payment/`)

```
payment/
├─ components/
│  ├─ payment-success-view.tsx   # Progressive UI (server prefetch + polling)
│  ├─ payment-failed-view.tsx    # Error state + retry
│  ├─ payment-status-view.tsx    # Redirect router (polls → redirects)
│  ├─ payment-checking-card.tsx  # Loading spinner card
│  ├─ order-summary-card.tsx     # Order details display
│  └─ pricing-modal.tsx          # Package selection + email form
├─ hooks/
│  └─ use-payment.ts            # useOrderStatus (polling hook)
└─ types/
```

**Payment UX notes:**
- Server prefetches order data → passes as `initialData` to React Query
- UI renders immediately with available data, polls in background
- Adaptive copy: "Sedang diverifikasi" → "Pembayaran berhasil!" based on status
- Status pipeline visible ke user: payment SUCCESS muncul dulu, lalu progress copy "Business plan sedang disiapkan…" sampai `pdfReady === true` (artinya pipeline Inngest sudah selesai render PDF)
- PDF download button appears when `pdfReady === true`

### Admin (`features/admin/`)

```
admin/
├─ api/
│  └─ admin-api.ts              # All admin API client methods (incl. retryGenerate, regeneratePdf)
├─ components/
│  ├─ admin-shell.tsx           # Sidebar + topbar layout
│  ├─ admin-topbar.tsx          # User menu dropdown
│  ├─ change-password-modal.tsx # Password change form
│  ├─ logout-button.tsx         # With confirmation dialog
│  ├─ overview-view.tsx         # Dashboard metrics + charts
│  ├─ overview-charts.tsx       # Recharts components
│  ├─ admin-order-table.tsx     # Orders TanStack Table (kolom Pipeline status)
│  ├─ admin-plan-table.tsx     # Plans TanStack Table
│  ├─ admin-log-table.tsx      # Logs TanStack Table
│  ├─ order-detail-view.tsx    # Order detail + email + Pipeline actions (Retry / Regenerate PDF)
│  ├─ plan-detail-view.tsx      # Plan detail (TanStack cached)
│  ├─ admin-generate-pdf-button.tsx # PDF regenerate with confirm
│  ├─ storage-browser-view.tsx  # R2 file browser
│  ├─ support-ticket-list.tsx   # Ticket list
│  └─ support-ticket-detail-view.tsx # Ticket detail + reply
├─ hooks/
│  ├─ use-admin-queries.ts      # All admin TanStack hooks (incl. useRetryOrderGenerate, useRegenerateOrderPdf)
│  ├─ use-debounced-value.ts    # Debounce utility
│  └─ use-search-params-state.ts # URL params sync
└─ types/
    └─ index.ts                 # All admin TypeScript types
```

**Admin pipeline actions (order detail page):**

Card **Pipeline Background Job** menampilkan status generation (`PAID` / `GENERATING` / `PDF_READY` / `FAILED`) lewat `<StatusBadge>` dan menyediakan dua tombol aksi:

| Tombol | Hook | Endpoint | Kapan aktif |
|---|---|---|---|
| Retry Pipeline | `useRetryOrderGenerate` | `POST /api/admin/orders/[orderId]/retry-generate` | Order SUCCESS + plan FAILED / PAID / GENERATING |
| Regenerate PDF | `useRegenerateOrderPdf` | `POST /api/admin/orders/[orderId]/regenerate-pdf` | Order SUCCESS + plan PDF_READY / FAILED / GENERATED |

Setelah klik, mutation invalidate cache order detail + list. Auto-polling React Query (5s saat plan belum final) langsung pickup status baru `GENERATING` dan terus polling sampai `PDF_READY`. Toast sukses/gagal muncul lewat sonner.

**Status badge mapping (tambahan setelah Inngest):**

| `PlanStatus` | Label | Variant |
|---|---|---|
| `PAID` | "Antri" | info — plan sudah dibayar, menunggu Inngest |
| `GENERATING` | "Sedang dibuat" | info — pipeline aktif |
| `PDF_READY` | "PDF Siap" | success |
| `FAILED` | "Failed" | danger — bisa di-retry admin |

---

## Landing Page Components (`src/components/landing/`)

| Component | Section | Fitur |
|-----------|---------|-------|
| `hero.tsx` | Hero | 100vh, 2-column, floating mockup cards, yellow CTA |
| `how-it-works.tsx` | Cara Kerja | 4 step cards, one highlighted blue |
| `example-output.tsx` | Output | CardSwap animation (3 screenshots), PDF viewer link |
| `magic-bento.tsx` | Fitur | 6-card bento grid, spotlight hover glow |
| `pricing-teaser.tsx` | Harga | 3 cards, Premium highlighted blue with yellow CTA |
| `testimonial-marquee.tsx` | Testimonial | 2-row infinite marquee, pause on hover |
| `faq.tsx` | FAQ | 10 accordion items, soft blue background |
| `cta-section.tsx` | CTA | Blue gradient, yellow CTA |

### Navbar (`src/components/layout/public-nav.tsx`)

**Behavior:**
- **Top state:** Transparent, white text, yellow CTA — menyatu dengan hero
- **Scrolled state:** Floating pill (rounded-full), glassmorphism white, shadow
- **Transition:** 300ms smooth animation
- **Threshold:** `scrollY > 24px`
- **Mobile:** Hamburger → slide-in drawer

---

## Shared Components (`src/components/shared/`)

| Component | Fungsi |
|-----------|--------|
| `brand-logo.tsx` | Logo + "BisnisApa.id" text |
| `confirm-dialog.tsx` | Reusable confirmation modal (default/warning/danger variants) |
| `currency-text.tsx` | Format Rupiah |
| `empty-state.tsx` | Empty data placeholder |
| `error-state.tsx` | Error with retry button |
| `loading-state.tsx` | Skeleton loading |
| `metric-card.tsx` | Dashboard metric card |
| `page-header.tsx` | Page title + description |
| `status-badge.tsx` | Colored status badge |

---

## Animations

### CSS Animations (`globals.css`)

```css
@keyframes marquee-left { 0% { translateX(0) } 100% { translateX(-50%) } }
@keyframes marquee-right { 0% { translateX(-50%) } 100% { translateX(0) } }
```

### Framer Motion

- Section reveal: fade + slide up (400ms)
- Step transitions: AnimatePresence mode="wait"
- Floating cards: `animate={{ y: [0, -6, 0] }}` infinite
- Card hover: translateY(-3px) + shadow increase

### GSAP

- `CardSwap` component: 3D card rotation + elastic swap animation
- Used in Example Output section with PDF screenshots

### Reduced Motion

All animations respect `prefers-reduced-motion: reduce` — durations set to 0.001ms.

---

## Routing Architecture

### Server Components (Static)
- Landing page (`/`)
- Examples page (`/examples`)
- Planner page (`/planner`)
- Login page (`/login`)

### Client Components (Dynamic)
- Wizard steps (AnimatePresence)
- Recommendations (TanStack Query)
- Payment status (polling)
- Admin tables (TanStack Table + Query)

### Server + Client Hybrid
- Payment success: server prefetches order → passes to client as `initialData`
- Dashboard layout: server auth guard → client shell

---

## Build & Development

```bash
# Development (Turbopack)
npm run dev

# Production build
npm run build

# Type check only
npx tsc --noEmit

# Clean build cache
npm run clean        # Remove-Item -Recurse -Force .next
npm run rebuild      # clean + build
```

### Build Output

- 21 static pages (prerendered)
- 30+ dynamic routes (server-rendered on demand)
- All API routes are dynamic (no static API)

---

## Conventions

### File Naming
- Components: `kebab-case.tsx` (e.g. `wizard-progress.tsx`)
- Hooks: `use-kebab-case.ts` (e.g. `use-admin-queries.ts`)
- Types: `index.ts` in `types/` folder
- API: `route.ts` in Next.js app directory

### Import Rules
- UI primitives: `@/components/ui/*`
- Shared components: `@/components/shared/*`
- Feature components: `@/features/*/components/*`
- API calls: always through `features/*/api/*` + `features/*/hooks/*`
- Never call `fetch()` directly from visual components

### Styling Rules
- Use Tailwind utility classes (no CSS modules)
- Brand colors as hex literals (e.g. `text-[#2563FF]`) — consistent with design system
- No `dark:` classes — light mode only
- Border radius: rounded-full for buttons/badges, rounded-2xl/3xl for cards
- Shadows: use design system shadow tokens

### Component Rules
- Server components for static content (landing, layout guards)
- Client components for interactivity (forms, tables, modals)
- Shared components must be generic and reusable
- Feature components can be specific to their domain
- All modals: ESC to close, backdrop click, body scroll lock
