# BisnisApa AI Design System — Revised Landing Page Spec

> **Brand:** BisnisApa AI  
> **Domain/Brand Context:** BisnisApa.id  
> **Slogan:** Idea to Business  
> **Primary Brand Color:** `#2563FF`  
> **Design Direction:** bold blue SaaS, clean, premium, trustworthy, AI-assisted, friendly for first-time business builders  
> **Main Goal:** membuat landing page yang terasa kuat secara brand, conversion-oriented, dan mudah diterjemahkan ke Next.js + Tailwind + shadcn/ui.

---

## 1. Core Visual Direction

Landing page BisnisApa AI harus terasa seperti:

```txt
Modern AI SaaS + Business planning assistant + clean Indonesian startup brand
```

Karakter visual utama:

- Dominan menggunakan **brand blue `#2563FF`** untuk hero, footer, section emphasis, dan background block besar.
- Text di atas background biru harus **putih** agar kontras dan terasa clean.
- Gunakan warna CTA yang berbeda dari biru utama agar tombol tetap standout ketika background utama juga biru.
- Gunakan layout luas, rounded cards, subtle glass effect, soft shadow, dan komponen interaktif secukupnya.
- Hindari tampilan terlalu ramai, terlalu neon, terlalu playful, atau terlalu corporate.

---

## 2. Color Palette

### 2.1 Primary Brand Colors

| Token | Hex | Usage |
|---|---:|---|
| `brand.blue` | `#2563FF` | Hero background, footer background, brand block, active state, blue section |
| `brand.blueDark` | `#1746C7` | Hover background untuk area biru, pressed state, deep blue gradient |
| `brand.blueSoft` | `#EAF0FF` | Soft background, card tint, icon background |
| `brand.blueMist` | `#F4F7FF` | Alternate section background |
| `brand.blueBorder` | `#BFD0FF` | Border untuk card/section bernuansa brand |

### 2.2 CTA Accent Colors

Karena `#2563FF` akan sering digunakan sebagai background besar, CTA utama perlu warna yang berbeda agar tetap menonjol.

| Token | Hex | Usage |
|---|---:|---|
| `cta.primary` | `#FFB020` | CTA utama di atas background biru, seperti “Mulai Cari Ide Bisnis” |
| `cta.primaryHover` | `#F59E0B` | Hover CTA utama |
| `cta.primaryText` | `#111827` | Text pada CTA kuning/oranye |
| `cta.secondary` | `#FFFFFF` | CTA secondary di atas background biru |
| `cta.secondaryText` | `#2563FF` | Text CTA putih |
| `cta.dark` | `#0F172A` | CTA gelap pada section putih |
| `cta.darkHover` | `#020617` | Hover CTA gelap |

**Rationale:** `#FFB020` memberi kontras kuat terhadap biru utama, terasa energik, dan cocok untuk action seperti mulai, bayar, atau pilih paket. Gunakan dengan hemat agar tetap premium.

### 2.3 Neutral Colors

| Token | Hex | Usage |
|---|---:|---|
| `neutral.white` | `#FFFFFF` | Text di blue background, card, modal |
| `neutral.offWhite` | `#F8FAFC` | Page background alternatif |
| `neutral.heading` | `#0F172A` | Heading di section putih |
| `neutral.body` | `#475569` | Body text di section putih |
| `neutral.muted` | `#94A3B8` | Metadata, helper text, disabled text |
| `neutral.border` | `#E2E8F0` | Border card/input |
| `neutral.dark` | `#020617` | Very dark text/background accent |

### 2.4 State Colors

| Token | Hex | Usage |
|---|---:|---|
| `state.success` | `#16A34A` | Payment success, generated success |
| `state.warning` | `#F59E0B` | Pending payment, quota limit |
| `state.danger` | `#DC2626` | Failed generation, failed payment |
| `state.info` | `#2563FF` | Informational state |

---

## 3. Color Usage Rules

### Main Rule

Website ini harus lebih berani memakai biru utama.

```txt
40% Brand blue / blue-tinted section
35% White / off-white background
15% Dark text / dark accent
10% CTA accent / yellow-orange highlight
```

### Rules for Blue Background

Jika background menggunakan `#2563FF`:

```txt
Heading: #FFFFFF
Paragraph: rgba(255, 255, 255, 0.78)
Muted text: rgba(255, 255, 255, 0.64)
Border: rgba(255, 255, 255, 0.18)
Card background: rgba(255, 255, 255, 0.10) atau #FFFFFF untuk mockup card
Primary CTA: #FFB020
Primary CTA text: #111827
Secondary CTA: #FFFFFF
Secondary CTA text: #2563FF
```

### Rules for White Background

Jika background putih/off-white:

```txt
Heading: #0F172A
Paragraph: #475569
Primary CTA: #2563FF atau #0F172A
Secondary CTA: #EAF0FF
Accent badge: #EAF0FF + #2563FF
```

---

## 4. Typography

### Recommended Font

Gunakan font yang minimalis, modern, tetapi tidak terlalu pasaran seperti Plus Jakarta Sans.

```txt
Primary Font: Geist Sans
Fallback: Manrope, Inter, system-ui, sans-serif
```

### Alternative Font Options

| Font | Character | Recommended Usage |
|---|---|---|
| `Geist Sans` | modern, clean, developer/SaaS feel, tidak terlalu ramai | Best overall untuk BisnisApa AI |
| `Manrope` | clean, friendly, readable | Jika ingin lebih rounded dan approachable |
| `Satoshi` | premium startup, minimal, stylish | Jika ingin feel lebih modern dan brand-led |
| `Onest` | clean, slightly unique, readable | Jika ingin alternatif yang lebih tidak pasaran |

### Final Choice

```txt
Primary Font: Geist Sans
Fallback: Manrope, Inter, system-ui, sans-serif
```

Reason:

- Minimalis dan cocok untuk SaaS.
- Tidak seumum Plus Jakarta Sans.
- Tetap readable untuk dashboard, form, pricing, FAQ, dan PDF-related UI.
- Cocok dengan visual biru solid yang modern.

---

## 5. Typography Scale

### Desktop

| Element | Size | Line Height | Weight | Usage |
|---|---:|---:|---:|---|
| Hero Heading | 64px - 76px | 0.98 - 1.08 | 750 - 850 | Headline utama hero |
| Section Heading | 40px - 52px | 1.1 - 1.2 | 700 - 800 | Heading section |
| Subsection Heading | 28px - 32px | 1.2 | 700 | Heading card besar |
| Card Title | 20px - 24px | 1.3 | 650 - 750 | Feature/pricing/testimonial title |
| Body Large | 18px - 20px | 1.65 | 400 - 500 | Hero paragraph, section intro |
| Body Base | 16px | 1.6 | 400 | General copy |
| Small Text | 13px - 14px | 1.5 | 400 - 600 | Badge, metadata, helper text |
| Button Text | 15px - 16px | 1 | 650 - 750 | CTA text |

### Mobile

| Element | Size | Line Height | Weight |
|---|---:|---:|---:|
| Hero Heading | 42px - 52px | 1.05 - 1.12 | 750 - 850 |
| Section Heading | 30px - 38px | 1.15 - 1.25 | 700 - 800 |
| Card Title | 18px - 22px | 1.3 | 650 - 750 |
| Body | 15px - 16px | 1.6 | 400 |
| Small Text | 13px - 14px | 1.5 | 400 - 600 |

---

## 6. Layout System

### Container

```txt
Max Width: 1200px - 1280px
Desktop Padding: 32px
Tablet Padding: 24px
Mobile Padding: 16px - 20px
```

### Section Spacing

```txt
Desktop Section Padding: 112px - 140px vertical
Tablet Section Padding: 80px - 96px vertical
Mobile Section Padding: 64px - 80px vertical
```

### Hero Height

Hero harus memenuhi 1 layar.

```txt
Min Height Desktop: 100vh
Min Height Mobile: auto, minimal 760px
Navbar included: hero content should remain vertically centered
```

### Grid

```txt
Desktop: 12-column grid
Tablet: 6-column grid
Mobile: 1-column grid
```

### Border Radius

```txt
Button: 999px atau 16px
Card: 24px
Large Mockup: 28px - 32px
Section Panel: 32px
Input: 14px - 16px
Accordion: 18px - 20px
```

---

## 7. Shadows & Effects

Gunakan shadow yang soft dan modern.

```css
--shadow-card: 0 16px 40px rgba(15, 23, 42, 0.08);
--shadow-floating: 0 24px 70px rgba(15, 23, 42, 0.16);
--shadow-blue: 0 24px 70px rgba(37, 99, 255, 0.24);
--shadow-cta: 0 14px 30px rgba(255, 176, 32, 0.28);
```

### Glass Card on Blue Background

```css
.glass-card {
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(18px);
}
```

---

## 8. Components

---

## Navbar Specification

Navbar menjadi elemen utama yang selalu terlihat dan harus terasa ringan saat user pertama membuka halaman, lalu berubah menjadi lebih solid ketika user mulai scroll.

### Navbar Structure

Navbar terdiri dari 3 area utama:

```txt
Left   : Logo + Brand Name
Center : Menu Navigation
Right  : CTA Button "Coba Gratis"
```

Recommended desktop layout:

```txt
[Logo BisnisApa AI]        [Beranda] [Cara Kerja] [Hasil PDF] [Harga] [FAQ]        [Coba Gratis]
```

### Navbar Menu Items

Menu tengah:

```txt
Beranda
Cara Kerja
Hasil PDF
Harga
FAQ
```

Optional jika ingin lebih lengkap:

```txt
Fitur
Testimonial
```

Namun untuk landing page yang clean, cukup gunakan 5 menu utama agar navbar tidak terlalu ramai.

### Initial State / Top State

Saat halaman pertama kali dibuka dan posisi scroll masih di paling atas:

```txt
Position: fixed / sticky top
Background: transparent
Border: none
Shadow: none
Text color: white
Logo text color: white
CTA background: #FFB020
CTA text: #0F172A
```

Karena hero menggunakan background `#2563FF`, maka navbar saat top harus menyatu dengan hero.

Recommended style:

```css
.navbar-top {
  background: transparent;
  color: #FFFFFF;
  box-shadow: none;
  border: none;
}
```

### Scrolled State / Floating Sticky State

Ketika user mulai scroll, navbar berubah menjadi sticky mengambang dengan animasi smooth.

Style:

```txt
Position: fixed
Top: 16px
Width: calc(100% - 32px)
Max width: 1180px - 1240px
Margin: 0 auto
Background: rgba(255, 255, 255, 0.86)
Backdrop blur: 16px - 20px
Border: 1px solid rgba(226, 232, 240, 0.8)
Border radius: 999px
Shadow: soft floating shadow
Text color: #0F172A
Logo text color: #0F172A
```

CSS reference:

```css
.navbar-scrolled {
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 999px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.12);
  color: #0F172A;
}
```

### Navbar Animation

Perubahan dari transparent ke floating harus smooth dan tidak patah.

Recommended transition:

```css
.navbar {
  transition:
    background-color 280ms ease,
    box-shadow 280ms ease,
    border-color 280ms ease,
    border-radius 280ms ease,
    top 280ms ease,
    width 280ms ease,
    color 220ms ease,
    transform 280ms ease;
}
```

Behavior:

```txt
Top state:
- Navbar full width mengikuti container.
- Tidak ada background.
- Terasa menyatu dengan hero.

Scrolled state:
- Navbar mengecil menjadi floating pill.
- Muncul background glassmorphism putih.
- Ada subtle shadow.
- Tetap fixed di atas.
```

### Logo Area

Logo area terdiri dari logo mark dan nama brand.

```txt
Logo mark size: 32px - 36px
Brand text: BisnisApa AI
Font weight: 700
Letter spacing: -0.02em
```

Top state:

```txt
Logo text color: #FFFFFF
```

Scrolled state:

```txt
Logo text color: #0F172A
```

Jika logo utama berwarna biru dan sulit terlihat di hero biru, gunakan versi logo putih khusus untuk top state.

### Center Menu Style

Menu tengah harus clean, tidak terlalu besar, dan nyaman dibaca.

```txt
Font size: 14px - 15px
Font weight: 500
Gap: 28px - 36px
Top state text: rgba(255, 255, 255, 0.86)
Top state hover: #FFFFFF
Scrolled text: #475569
Scrolled hover: #2563FF
Active menu: #2563FF
```

Hover behavior:

```txt
Hover text menjadi lebih tegas.
Boleh tambahkan underline kecil atau soft blue pill, tapi jangan terlalu ramai.
```

Recommended active item style:

```txt
Background: rgba(37, 99, 255, 0.08)
Text: #2563FF
Radius: 999px
Padding: 8px 12px
```

Namun untuk top state, active item bisa menggunakan:

```txt
Background: rgba(255, 255, 255, 0.14)
Text: #FFFFFF
```

### CTA Button in Navbar

CTA kanan:

```txt
Text: Coba Gratis
Background: #FFB020
Text color: #0F172A
Hover background: #F59E0B
Radius: 999px
Padding: 11px 18px
Font size: 14px - 15px
Font weight: 700
```

Reason:

```txt
Karena warna brand utama #2563FF banyak dipakai sebagai background,
CTA perlu warna berbeda agar lebih terlihat dan mendorong action.
```

Optional secondary hover animation:

```txt
Hover: translateY(-1px)
Shadow: 0 10px 24px rgba(255, 176, 32, 0.28)
```

### Mobile Navbar

Pada mobile, navbar tetap sticky/fixed dengan layout:

```txt
Left  : Logo + Brand Name
Right : CTA kecil / Menu Button
```

Recommended mobile behavior:

```txt
Logo tetap terlihat.
Menu tengah disembunyikan.
CTA "Coba Gratis" boleh tetap ditampilkan jika ruang cukup.
Tambahkan hamburger button untuk membuka mobile menu.
```

Mobile top state:

```txt
Background: transparent
Text: white
```

Mobile scrolled state:

```txt
Background: rgba(255, 255, 255, 0.9)
Backdrop blur: 18px
Border radius: 24px
Shadow: soft
```

Mobile menu dropdown:

```txt
Position: absolute
Top: calc(100% + 12px)
Left: 0
Right: 0
Background: #FFFFFF
Border: 1px solid #E2E8F0
Radius: 24px
Padding: 16px
Shadow: 0 18px 48px rgba(15, 23, 42, 0.12)
```

Mobile menu items:

```txt
Height: 44px
Radius: 12px
Text: #0F172A
Hover/active background: #EEF4FF
Hover/active text: #2563FF
```

### Navbar Z-Index

Navbar harus selalu berada di atas section lain.

```txt
z-index: 50 atau 100
```

Pastikan elemen hero visual di kanan tidak menimpa navbar.

### Implementation Notes

Untuk Next.js + React, gunakan state scroll:

```txt
isScrolled = window.scrollY > 16
```

Recommended threshold:

```txt
16px - 32px
```

Agar transisi tidak terlalu sensitif, gunakan threshold `24px`.

### Tailwind Class Direction

Top state example:

```tsx
<header className="fixed left-0 right-0 top-0 z-50 transition-all duration-300">
  <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 text-white">
    ...
  </nav>
</header>
```

Scrolled state example:

```tsx
<header className="fixed left-0 right-0 top-4 z-50 transition-all duration-300">
  <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border border-slate-200/80 bg-white/85 px-5 text-slate-950 shadow-[0_18px_48px_rgba(15,23,42,0.12)] backdrop-blur-xl">
    ...
  </nav>
</header>
```

### Navbar Final Direction

Navbar harus terasa:

```txt
Transparent and immersive at first view.
Floating, premium, and focused after scroll.
Smooth, not jumpy.
Clean SaaS, not crowded.
CTA tetap paling menonjol.
```


## 8.1 Buttons

### Primary CTA on Blue Background

Use for the most important action in hero and footer.

```txt
Background: #FFB020
Text: #111827
Hover: #F59E0B
Radius: 999px
Font weight: 700
Padding desktop: 15px 26px
Padding mobile: 13px 22px
Shadow: 0 14px 30px rgba(255, 176, 32, 0.28)
```

Text examples:

```txt
Mulai Cari Ide Bisnis
Buat Rencana Bisnis
Pilih Paket Premium
```

### Secondary CTA on Blue Background

```txt
Background: #FFFFFF
Text: #2563FF
Hover: #F4F7FF
Border: rgba(255, 255, 255, 0.2)
Radius: 999px
```

Text examples:

```txt
Lihat Contoh PDF
Pelajari Cara Kerjanya
```

### Primary CTA on White Background

```txt
Background: #2563FF
Text: #FFFFFF
Hover: #1746C7
Radius: 999px
Shadow: 0 14px 30px rgba(37, 99, 255, 0.24)
```

### Dark CTA

Use sparingly for pricing or output section.

```txt
Background: #0F172A
Text: #FFFFFF
Hover: #020617
Radius: 999px
```

---

## 8.2 Cards

### Standard Card

```txt
Background: #FFFFFF
Border: 1px solid #E2E8F0
Radius: 24px
Padding: 24px - 32px
Shadow: 0 16px 40px rgba(15, 23, 42, 0.08)
```

### Blue Surface Card

```txt
Background: #2563FF
Text: #FFFFFF
Border: 1px solid rgba(255, 255, 255, 0.18)
Radius: 28px
```

### Soft Blue Card

```txt
Background: #F4F7FF
Border: 1px solid #BFD0FF
Text: #0F172A
Radius: 24px
```

### Highlight Pricing Card

```txt
Background: #2563FF
Text: #FFFFFF
Border: 1px solid rgba(255, 255, 255, 0.2)
CTA: #FFB020
Badge: #FFFFFF text #2563FF
Shadow: 0 24px 70px rgba(37, 99, 255, 0.28)
```

---

## 8.3 Badges

### Badge on Blue Background

```txt
Background: rgba(255, 255, 255, 0.14)
Text: #FFFFFF
Border: rgba(255, 255, 255, 0.20)
Radius: 999px
```

### Badge on White Background

```txt
Background: #EAF0FF
Text: #2563FF
Border: #BFD0FF
Radius: 999px
```

### CTA Accent Badge

```txt
Background: #FFF7E6
Text: #B45309
Border: #FED7AA
Radius: 999px
```

---

## 8.4 Forms / Inputs

```txt
Background: #FFFFFF
Border: #E2E8F0
Focus Border: #2563FF
Focus Ring: rgba(37, 99, 255, 0.16)
Text: #0F172A
Placeholder: #94A3B8
Radius: 16px
Height: 48px - 52px
```

---

## 9. Landing Page Structure

Final order:

1. Navbar
2. Hero Section
3. How It Works
4. Output Result / Generated PDF Preview
5. Magic Bento Feature Section
6. Pricing
7. Testimonial Marquee
8. FAQ
9. Footer

---

# 10. Section Specification

## 10.1 Navbar

### Layout

```txt
Position: absolute atau fixed di atas hero
Background: transparent di hero, blur saat scroll
Height: 72px - 80px
Container: max 1280px
```

### Visual

Jika berada di hero biru:

```txt
Logo: white version atau logo mark + white text
Nav links: rgba(255,255,255,0.80)
Nav hover: #FFFFFF
CTA small: white background + blue text
```

Jika sticky setelah scroll:

```txt
Background: rgba(255,255,255,0.82)
Backdrop blur: 16px
Border bottom: #E2E8F0
Logo: default brand color
Nav links: #475569
CTA: #2563FF background + white text
```

### Menu Items

```txt
Cara Kerja
Contoh Hasil
Fitur
Harga
FAQ
```

---

## 10.2 Hero Section

### Goal

Hero harus langsung menjelaskan value BisnisApa AI: membantu user menemukan ide bisnis dan membuat rencana bisnis yang lebih realistis berdasarkan input mereka.

### Layout

```txt
Background: #2563FF
Text: #FFFFFF
Height: 100vh desktop
Min height mobile: 760px
Grid: 2 columns desktop
Left: copywriting + CTA + trust indicators
Right: display/mockup/interactive preview
```

### Left Section

Content structure:

```txt
Badge: AI Business Planner untuk Pemula
Headline: Dari bingung mau bisnis apa, jadi punya rencana yang lebih jelas.
Subheadline: Jawab beberapa pertanyaan sederhana tentang modal, lokasi, minat, dan target pasar. BisnisApa AI akan bantu menyusun rekomendasi ide bisnis hingga draft rencana bisnis yang siap kamu pelajari.
CTA Primary: Mulai Cari Ide Bisnis
CTA Secondary: Lihat Contoh PDF
Trust Microcopy: Tanpa klaim pasti untung. Fokus pada estimasi awal yang realistis.
```

### Right Section Display Ideas

Gunakan salah satu atau kombinasi:

1. **AI Recommendation Preview Card**
   - Menampilkan 4 rekomendasi bisnis.
   - Ada score “Kecocokan”, modal awal, target market, dan tingkat kesulitan.

2. **Generated PDF Mockup**
   - Preview cover PDF “Rencana Bisnis Rice Bowl Rumahan”.
   - Ada halaman kecil bertumpuk seperti document stack.

3. **Input-to-Output Flow**
   - Card kecil: Modal, Lokasi, Minat, Target.
   - Panah menuju output: Rekomendasi + PDF Plan.

Recommended final display:

```txt
Right side menggunakan floating dashboard mockup:
- Main card: “4 Ide Bisnis Cocok Untukmu”
- Side mini card: “Estimasi Modal: < Rp1 juta”
- Side mini card: “PDF Plan siap dibuat”
- Bottom mini card: progress steps AI sedang menganalisis
```

### Hero Visual Rules

```txt
Use glassmorphism lightly
Cards on hero can be white with dark text for readability
Add subtle radial gradient: rgba(255,255,255,0.18) behind mockup
Avoid too many icons
Use 1-2 floating cards only
```

### Hero CSS Direction

```css
.hero {
  min-height: 100vh;
  background:
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.22), transparent 28%),
    linear-gradient(135deg, #2563FF 0%, #1746C7 100%);
  color: #FFFFFF;
}
```

---

## 10.3 How It Works Section

### Goal

Menjelaskan cara kerja sistem dengan ringkas dan visual.

### Layout

```txt
Background: #FFFFFF
Section heading center
Steps: 4 cards horizontal desktop, vertical mobile
Add connecting line on desktop
```

### Heading Copy

```txt
Cara kerja yang sederhana, hasilnya lebih terarah.
```

Subheading:

```txt
Tidak perlu mulai dari dokumen kosong. Kamu cukup jawab pertanyaan penting, lalu sistem membantu menyusun arah bisnis awal.
```

### Steps

| Step | Title | Description | Visual |
|---:|---|---|---|
| 01 | Isi Preferensi Bisnis | Masukkan modal, lokasi, minat, pengalaman, dan target pasar. | Form/input icon |
| 02 | AI Membaca Konteks | Sistem memetakan peluang yang lebih cocok dengan kondisi awalmu. | Sparkles/brain icon |
| 03 | Dapat 4 Rekomendasi | Lihat ide bisnis dengan estimasi modal, potensi pasar, dan tingkat kesulitan. | Cards/grid icon |
| 04 | Generate Business Plan | Pilih ide terbaik lalu buat PDF rencana bisnis sesuai paket. | File text icon |

### Card Design

```txt
Card background: #F8FAFC
Active/highlight card: #2563FF with white text
Icon container: #EAF0FF or rgba(255,255,255,0.16) for active card
Number badge: #FFB020
Radius: 24px
Hover: lift -3px + blue shadow
```

---

## 10.4 Output Result / Generated PDF Preview Section

### Goal

Menunjukkan bahwa output BisnisApa AI bukan sekadar teks mentah, tetapi hasil rencana bisnis yang rapi dan bisa dipelajari.

### Layout

```txt
Background: #F4F7FF
Grid: 2 columns desktop
Left: copywriting + output highlights
Right: PDF preview mockup
```

### Left Section Copy

Heading:

```txt
Hasil akhirnya berupa PDF rencana bisnis yang lebih mudah dibaca.
```

Subheading:

```txt
Setiap rencana disusun agar padat, praktis, dan membantu kamu memahami gambaran modal, omzet, operasional, hingga strategi pemasaran awal.
```

Highlights:

```txt
- Ringkasan ide bisnis dan positioning
- Estimasi modal awal dan kebutuhan utama
- Estimasi omzet, HPP, margin, dan balik modal
- Skenario bisnis dan marketing plan 30 hari
- Catatan sumber data dan asumsi perhitungan
```

CTA:

```txt
Lihat Contoh PDF
```

### Right Section PDF Preview

Mockup content:

```txt
PDF Cover: Rencana Bisnis Rice Bowl Rumahan
Page 1: Ringkasan Bisnis
Page 2: Estimasi Modal
Page 3: HPP & Margin
Page 4: Marketing Plan 30 Hari
```

Visual rules:

```txt
Use stacked document cards
Main PDF card background: #FFFFFF
Header strip: #2563FF
Small yellow CTA accent label: “Premium Output”
Add page number and watermark BisnisApa AI in mockup
```

---

## 10.5 Magic Bento Section

### Goal

Memakai gaya **Magic Bento** untuk menampilkan fitur utama BisnisApa AI dengan cara yang lebih interaktif dan memorable.

### Layout

```txt
Background: #FFFFFF
Heading center
Bento grid: 6 cards desktop
Grid style: asymmetrical but balanced
Large card spans 2 columns
Cards have hover glow, spotlight, or magnetic feel
```

### Heading Copy

```txt
Bukan cuma generate teks, tapi bantu menyusun arah bisnis.
```

Subheading:

```txt
Setiap fitur dirancang agar hasilnya lebih relevan, rapi, dan tidak terasa seperti jawaban AI yang asal panjang.
```

### Bento Card Content

#### Card 1 — Smart Recommendation Engine

```txt
Title: Rekomendasi ide yang lebih kontekstual
Description: AI membaca modal, lokasi, minat, pengalaman, dan target pasar sebelum memberi rekomendasi.
Size: Large
Visual: animated recommendation cards / score meter
```

#### Card 2 — Realistic Estimation

```txt
Title: Estimasi lebih masuk akal
Description: Angka tidak dibuat terlalu optimis. Sistem diarahkan untuk memakai asumsi yang wajar dan mudah dijelaskan.
Visual: mini calculator / bar chart
```

#### Card 3 — Source-Aware Planning

```txt
Title: Bisa diarahkan pakai data aktual
Description: Untuk kebutuhan tertentu, harga dan asumsi dapat dilengkapi sumber agar lebih akuntabel.
Visual: citation chips / link cards
```

#### Card 4 — Fixed PDF Template

```txt
Title: Template PDF rapi dan konsisten
Description: AI menyusun konten, sistem menampilkan hasilnya ke template PDF yang sudah didesain premium.
Visual: PDF page stack
```

#### Card 5 — Pricing Gate Friendly

```txt
Title: Flow upgrade tidak mengganggu
Description: User tetap bisa melihat rekomendasi gratis, lalu upgrade ketika ingin membuat business plan.
Visual: lock/unlock card
```

#### Card 6 — Admin Monitoring

```txt
Title: Siap dipantau dari dashboard
Description: Order, status pembayaran, dan hasil generate bisa dipantau lebih rapi dari sisi admin.
Visual: dashboard mini chart
```

### Interaction Rules

```txt
Hover: spotlight glow mengikuti cursor
Card radius: 28px
Border: #E2E8F0
Hover border: #BFD0FF
Large card background: #2563FF with white text
Other cards: #FFFFFF or #F8FAFC
Use CTA accent only on small visual details
```

### Implementation Note

Gunakan Magic Bento dari React Bits sebagai interactive feature grid. React Bits menyediakan koleksi komponen React animatif dan customizable untuk membangun UI yang lebih memorable. Untuk section ini, gunakan animasi secara halus agar tetap terasa premium, bukan gimmicky.

---

## 10.6 Pricing Section

### Goal

Menjelaskan 3 paket dengan jelas dan conversion-oriented.

### Layout

```txt
Background: #F8FAFC
Heading center
3 pricing cards
Premium highlighted with blue background
```

### Heading Copy

```txt
Pilih paket sesuai kebutuhan rencana bisnismu.
```

Subheading:

```txt
Mulai dari rekomendasi gratis, lalu upgrade saat kamu butuh PDF rencana bisnis yang lebih lengkap.
```

### Plans

#### Free

```txt
Price: Rp0
Description: Untuk mencoba dan mendapatkan arah awal ide bisnis.
Features:
- Isi form kebutuhan bisnis
- Mendapatkan rekomendasi ide bisnis
- Sampai halaman rekomendasi 4 ide bisnis
- Tidak termasuk PDF business plan
CTA: Mulai Gratis
Style: white card, neutral border
```

#### Basic

```txt
Price: Rp49.000
Description: Untuk membuat rencana bisnis ringkas yang mudah dipahami.
Features:
- PDF business plan ringkas
- Ringkasan ide dan target pasar
- Estimasi modal awal
- Estimasi omzet
- Estimasi balik modal
CTA: Pilih Basic
Style: white card with blue CTA
```

#### Premium

```txt
Price: Rp99.000
Badge: Paling Lengkap
Description: Untuk rencana bisnis yang lebih detail dan siap dipelajari lebih serius.
Features:
- Semua fitur Basic
- HPP & margin
- Operasional bulanan
- 3 skenario bisnis
- Marketing plan 30 hari
- Catatan asumsi dan sumber data
CTA: Pilih Premium
Style: blue card, white text, yellow CTA
```

### Pricing Design Rules

```txt
Premium card harus paling menonjol
Use #2563FF as premium background
Premium CTA uses #FFB020
Feature check icon: blue on white cards, yellow/white on premium card
Avoid long paragraph inside cards
Use compact feature list
```

---

## 10.7 Testimonial Section

### Goal

Memberi social proof dengan visual yang dinamis.

### Layout

```txt
Background: #FFFFFF
Heading center
2 marquee rows
Row 1 flows left
Row 2 flows right
Each row loops infinitely
```

### Heading Copy

```txt
Dibuat untuk orang yang ingin mulai bisnis dengan lebih terarah.
```

Subheading:

```txt
Cocok untuk pelajar, pekerja, UMKM pemula, dan siapa pun yang ingin mengubah ide menjadi rencana awal.
```

### Testimonial Card Design

```txt
Width: 320px - 380px
Background: #FFFFFF
Border: #E2E8F0
Radius: 24px
Padding: 20px
Shadow: subtle
Avatar: initials circle with blue tint
Name: bold
Role: muted
Quote: body text
```

### Example Testimonials

```txt
“Biasanya aku bingung mulai dari mana. Di sini jadi kebayang bisnis apa yang cocok dengan modal kecil.”
— Raka, Mahasiswa

“Output PDF-nya enak dibaca, bukan cuma jawaban AI yang panjang.”
— Dinda, Karyawan

“Bagian estimasi modal dan balik modal membantu buat mikir lebih realistis.”
— Arif, Calon UMKM

“Flow-nya simpel. Isi pertanyaan, dapat rekomendasi, lalu pilih ide yang mau dibuatkan plan.”
— Nabila, Freelancer

“Cocok untuk validasi awal sebelum keluar modal lebih besar.”
— Fajar, Pemula Bisnis
```

### Marquee Behavior

```txt
Row 1: translateX from 0 to -50%, duration 35s
Row 2: translateX from -50% to 0, duration 38s
Pause on hover: true
Gradient mask left-right: true
Reduced motion: disable animation and show static grid
```

---

## 10.8 FAQ Section

### Goal

Menjawab pertanyaan paling umum secara ringkas dan mengurangi keraguan user sebelum checkout.

### Layout

```txt
Background: #F4F7FF
Heading left or center
FAQ accordion max width: 860px
Accordion cards: white background, rounded, subtle border
```

### Heading Copy

```txt
Pertanyaan yang sering ditanyakan.
```

Subheading:

```txt
Beberapa hal penting sebelum kamu menggunakan BisnisApa AI.
```

### FAQ Items

1. **Apa itu BisnisApa AI?**  
   BisnisApa AI adalah platform yang membantu pengguna menemukan ide bisnis dan menyusun rencana bisnis awal berdasarkan modal, lokasi, minat, dan target pasar.

2. **Apakah hasil rekomendasi bisnis dijamin sukses?**  
   Tidak. Hasil dari sistem adalah estimasi dan panduan awal, bukan jaminan keuntungan. User tetap perlu melakukan validasi pasar dan perhitungan lanjutan.

3. **Apa yang didapat pada paket Free?**  
   Paket Free memungkinkan user mengisi form dan mendapatkan rekomendasi ide bisnis sampai halaman rekomendasi 4 ide bisnis, tanpa PDF business plan.

4. **Apa bedanya Basic dan Premium?**  
   Basic berisi PDF rencana bisnis ringkas seperti estimasi modal, omzet, dan balik modal. Premium berisi versi lebih lengkap dengan HPP, margin, operasional bulanan, 3 skenario bisnis, dan marketing plan 30 hari.

5. **Bagaimana jika pembayaran berhasil tetapi PDF gagal dibuat?**  
   User dapat menghubungi support melalui email dengan menyertakan email akun, waktu transaksi, dan bukti pembayaran. Tim support akan membantu pengecekan dan regenerasi jika diperlukan.

6. **Apakah data harga dan estimasi selalu akurat?**  
   Estimasi dapat berbeda tergantung lokasi, supplier, dan kondisi pasar. Untuk paket/fitur tertentu, sistem dapat diarahkan menampilkan sumber data dan asumsi agar lebih transparan.

7. **Apakah saya bisa mengubah jawaban setelah hasil keluar?**  
   Jika sistem menyediakan edit/regenerate, user dapat memperbarui input dan membuat ulang rekomendasi. Jika belum tersedia, user dapat membuat proses baru.

8. **Apakah PDF bisa digunakan langsung untuk proposal bisnis?**  
   PDF dapat digunakan sebagai draft awal. Untuk proposal resmi, sebaiknya user melakukan review, menyesuaikan angka, dan melengkapi data sesuai kondisi bisnis sebenarnya.

9. **Apakah data saya aman?**  
   Data digunakan untuk memproses rekomendasi dan rencana bisnis. Hindari memasukkan data sensitif yang tidak diperlukan.

10. **Bagaimana cara menghubungi support?**  
   User dapat menghubungi support melalui email `support@bisnisapa.id` untuk kendala pembayaran, PDF, akun, atau pertanyaan lain.

### Accordion Design Rules

```txt
Closed item: white background, #E2E8F0 border
Open item: #FFFFFF with blue border #BFD0FF
Question: #0F172A, font weight 650
Answer: #475569
Icon: plus/minus or chevron, #2563FF
Radius: 20px
Spacing between item: 12px
```

---

## 10.9 Footer

### Goal

Menutup landing page dengan brand yang kuat, navigasi jelas, dan akses support yang mudah.

### Layout

```txt
Background: #2563FF
Text: #FFFFFF
Padding top: 80px
Padding bottom: 32px
Grid: 4 columns desktop, 1 column mobile
```

### Footer Columns

#### Column 1 — Brand

```txt
Logo: BisnisApa AI
Description: Membantu mengubah ide sederhana menjadi rencana bisnis awal yang lebih jelas dan realistis.
CTA small: Mulai Cari Ide Bisnis
```

#### Column 2 — Menu

```txt
Cara Kerja
Contoh Hasil
Fitur
Harga
FAQ
```

#### Column 3 — Fitur

```txt
Rekomendasi Ide Bisnis
Generate PDF Business Plan
Estimasi Modal
Estimasi Omzet
Marketing Plan 30 Hari
```

#### Column 4 — Support

```txt
Email: support@bisnisapa.id
Bantuan Pembayaran
Kendala Generate PDF
Syarat & Ketentuan
Kebijakan Privasi
```

### Footer Bottom

```txt
© 2026 BisnisApa AI. All rights reserved.
Disclaimer: Hasil AI adalah estimasi dan panduan awal, bukan jaminan keuntungan bisnis.
```

### Footer Visual Rules

```txt
Link color: rgba(255,255,255,0.78)
Link hover: #FFFFFF
Divider: rgba(255,255,255,0.16)
CTA: #FFB020 background + #111827 text
```

---

## 11. Motion / Interaction

Use subtle but polished motion.

### Global Motion

```txt
Button hover: translateY(-1px), 160ms ease
Card hover: translateY(-3px), shadow increase, 180ms ease
Section reveal: fade + slide up, 400ms ease
Hero mockup: slow floating animation, 5s ease-in-out infinite
Marquee: infinite horizontal movement
Accordion: height animation 200ms ease
```

### Reduced Motion

Always support reduced motion.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 12. Tailwind Theme Configuration

Use this inside `tailwind.config.ts`.

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2563FF",
          blueDark: "#1746C7",
          blueSoft: "#EAF0FF",
          blueMist: "#F4F7FF",
          blueBorder: "#BFD0FF",
        },
        cta: {
          primary: "#FFB020",
          primaryHover: "#F59E0B",
          primaryText: "#111827",
          secondary: "#FFFFFF",
          secondaryText: "#2563FF",
          dark: "#0F172A",
          darkHover: "#020617",
        },
        neutral: {
          white: "#FFFFFF",
          offWhite: "#F8FAFC",
          heading: "#0F172A",
          body: "#475569",
          muted: "#94A3B8",
          border: "#E2E8F0",
          dark: "#020617",
        },
        state: {
          success: "#16A34A",
          warning: "#F59E0B",
          danger: "#DC2626",
          info: "#2563FF",
        },
      },
      fontFamily: {
        sans: ["Geist Sans", "Manrope", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        card: "0 16px 40px rgba(15, 23, 42, 0.08)",
        floating: "0 24px 70px rgba(15, 23, 42, 0.16)",
        blue: "0 24px 70px rgba(37, 99, 255, 0.24)",
        cta: "0 14px 30px rgba(255, 176, 32, 0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 13. CSS Variables

Use this in `globals.css`.

```css
:root {
  --brand-blue: #2563FF;
  --brand-blue-dark: #1746C7;
  --brand-blue-soft: #EAF0FF;
  --brand-blue-mist: #F4F7FF;
  --brand-blue-border: #BFD0FF;

  --cta-primary: #FFB020;
  --cta-primary-hover: #F59E0B;
  --cta-primary-text: #111827;
  --cta-secondary: #FFFFFF;
  --cta-secondary-text: #2563FF;
  --cta-dark: #0F172A;
  --cta-dark-hover: #020617;

  --neutral-white: #FFFFFF;
  --neutral-off-white: #F8FAFC;
  --neutral-heading: #0F172A;
  --neutral-body: #475569;
  --neutral-muted: #94A3B8;
  --neutral-border: #E2E8F0;
  --neutral-dark: #020617;

  --state-success: #16A34A;
  --state-warning: #F59E0B;
  --state-danger: #DC2626;
  --state-info: #2563FF;
}
```

---

## 14. shadcn/ui Theme Direction

Recommended:

```txt
Style: New York
Base color: Slate
Radius: 1rem
```

Suggested CSS variable mapping:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222 84% 5%;

  --card: 0 0% 100%;
  --card-foreground: 222 84% 5%;

  --primary: 224 100% 57%;
  --primary-foreground: 0 0% 100%;

  --secondary: 220 100% 96%;
  --secondary-foreground: 224 100% 57%;

  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;

  --accent: 39 100% 56%;
  --accent-foreground: 221 39% 11%;

  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;

  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 224 100% 57%;

  --radius: 1rem;
}
```

---

## 15. Recommended Icons

Use `lucide-react`.

Recommended icons:

```txt
Sparkles
FileText
Wallet
MapPin
Target
ChartNoAxesCombined
BadgeCheck
CreditCard
CircleHelp
Mail
ShieldCheck
```

Icon rules:

```txt
On blue background: white icon or yellow accent icon
On white background: #2563FF icon with #EAF0FF container
Stroke width: 2px
Icon container radius: 16px - 20px
```

---

## 16. Copywriting Rules

Use language that is:

- Clear
- Helpful
- Practical
- Reassuring
- Not too formal
- Not too hype

Avoid claims:

```txt
Dijamin sukses
Pasti untung
Auto kaya
100% berhasil
Tanpa risiko
```

Use safer words:

```txt
Lebih realistis
Lebih terarah
Estimasi awal
Gambaran awal
Berdasarkan input pengguna
Perlu validasi lanjutan
```

---

## 17. Implementation Checklist

- [ ] Use `#2563FF` as dominant brand blue.
- [ ] Use white text on hero and footer.
- [ ] Use `#FFB020` as primary CTA on blue backgrounds.
- [ ] Use `Geist Sans` as primary font.
- [ ] Hero uses 100vh desktop height.
- [ ] Hero has 2 columns: left copy, right product display/mockup.
- [ ] How It Works has 4 steps with visual connection.
- [ ] Output section has left copy and right PDF preview.
- [ ] Magic Bento section contains 6 feature cards.
- [ ] Pricing has Free, Basic Rp49.000, Premium Rp99.000.
- [ ] Premium pricing card is highlighted with blue background.
- [ ] Testimonial uses 2 infinite marquee rows in opposite directions.
- [ ] FAQ contains 10 accordion items.
- [ ] Footer uses `#2563FF` background and white text.
- [ ] All motion supports reduced motion.
- [ ] Avoid exaggerated success claims.

---

## 18. Final Visual Summary

```txt
Hero: bold blue, white text, yellow CTA, floating AI output mockup
How It Works: clean white, 4 step cards, one blue highlighted card
Output Preview: soft blue background, copy left, PDF mockup right
Magic Bento: premium interactive grid, feature-driven, not gimmicky
Pricing: simple 3 cards, Premium highlighted blue
Testimonials: 2-row infinite marquee, calm social proof
FAQ: clean accordion on soft blue background
Footer: blue background, white text, clear support/menu links
```
