/**
 * Generates all JuruScope brand image assets from master SVG sources.
 * Run with: npx tsx scripts/generate-logos.ts
 */
import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

const ROOT = process.cwd();
const PUB = path.join(ROOT, "public");
const APP = path.join(ROOT, "src", "app");
const PDF = path.join(ROOT, "src", "server", "pdf");

// ── Master icon SVG (64×64 viewBox, scope reticle design) ────────────────────
const SVG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="#4B5320"/>
  <circle cx="32" cy="32" r="20" fill="none" stroke="#C9A24E" stroke-width="2.5"/>
  <circle cx="32" cy="32" r="8"  fill="none" stroke="#C9A24E" stroke-width="2"/>
  <line x1="10" y1="32" x2="22" y2="32" stroke="#C9A24E" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="42" y1="32" x2="54" y2="32" stroke="#C9A24E" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="32" y1="10" x2="32" y2="22" stroke="#C9A24E" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="32" y1="42" x2="32" y2="54" stroke="#C9A24E" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="32" cy="32" r="3.5" fill="#C9A24E"/>
</svg>`;

// ── OG image SVG (1200×630, scope + wordmark) ────────────────────────────────
const SVG_OG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4B5320"/>
      <stop offset="100%" stop-color="#2A311A"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- Decorative rings -->
  <circle cx="600" cy="280" r="310" fill="none" stroke="rgba(201,162,78,0.06)" stroke-width="2"/>
  <circle cx="600" cy="280" r="250" fill="none" stroke="rgba(201,162,78,0.09)" stroke-width="1"/>
  <!-- Main scope -->
  <circle cx="600" cy="280" r="190" fill="none" stroke="#C9A24E" stroke-width="3"   opacity="0.82"/>
  <circle cx="600" cy="280" r="85"  fill="none" stroke="#C9A24E" stroke-width="2.5" opacity="0.82"/>
  <!-- Crosshairs -->
  <line x1="370" y1="280" x2="505" y2="280" stroke="#C9A24E" stroke-width="3" stroke-linecap="round" opacity="0.82"/>
  <line x1="695" y1="280" x2="830" y2="280" stroke="#C9A24E" stroke-width="3" stroke-linecap="round" opacity="0.82"/>
  <line x1="600" y1="50"  x2="600" y2="185" stroke="#C9A24E" stroke-width="3" stroke-linecap="round" opacity="0.82"/>
  <line x1="600" y1="375" x2="600" y2="510" stroke="#C9A24E" stroke-width="3" stroke-linecap="round" opacity="0.82"/>
  <!-- Center -->
  <circle cx="600" cy="280" r="11" fill="#C9A24E" opacity="0.88"/>
  <!-- Wordmark -->
  <text x="600" y="566" text-anchor="middle"
        font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
        font-size="58" font-weight="800" fill="#FFFFFF">Juru<tspan fill="#C9A24E">Scope</tspan></text>
  <!-- Tagline -->
  <text x="600" y="606" text-anchor="middle"
        font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
        font-size="21" font-weight="400" fill="rgba(255,255,255,0.60)">AI Self Discovery untuk Gen Z</text>
</svg>`;

// ── Helpers ───────────────────────────────────────────────────────────────────
async function writeIcon(buf: Buffer, dest: string, size: number) {
  await sharp(buf).resize(size, size).png().toFile(dest);
  console.log(`  ✓ ${path.relative(ROOT, dest)} (${size}px)`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Generating JuruScope brand assets…\n");

  const iconBuf = Buffer.from(SVG_ICON);
  const ogBuf = Buffer.from(SVG_OG);

  // ── Icon variants ──────────────────────────────────────────────────────────
  const icons: [string, number][] = [
    [path.join(PUB, "logo.png"), 64],
    [path.join(PUB, "favicon-16x16.png"), 16],
    [path.join(PUB, "favicon-32x32.png"), 32],
    [path.join(PUB, "apple-touch-icon.png"), 180],
    [path.join(PUB, "icon-192.png"), 192],
    [path.join(PUB, "icon-512.png"), 512],
    [path.join(APP, "icon.png"), 512],
    [path.join(APP, "apple-icon.png"), 180],
  ];

  for (const [dest, size] of icons) await writeIcon(iconBuf, dest, size);

  // ── favicon.ico (PNG binary accepted by all modern browsers) ───────────────
  const fav32 = await sharp(iconBuf).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(APP, "favicon.ico"), fav32);
  console.log("  ✓ src/app/favicon.ico (32px)");

  // ── Master SVG (source of truth) ───────────────────────────────────────────
  fs.writeFileSync(path.join(PUB, "logo.svg"), SVG_ICON);
  console.log("  ✓ public/logo.svg");

  // ── OG image ───────────────────────────────────────────────────────────────
  await sharp(ogBuf).resize(1200, 630).png().toFile(path.join(PUB, "og-image.png"));
  console.log("  ✓ public/og-image.png (1200×630)");

  // ── Base64 for PDF embedding ───────────────────────────────────────────────
  const b64 = (await sharp(iconBuf).resize(64, 64).png().toBuffer()).toString("base64");
  fs.writeFileSync(
    path.join(PDF, "logo-base64.ts"),
    `/** Auto-generated 64x64 logo for PDF/email embedding */\nexport const LOGO_BASE64 = "data:image/png;base64,${b64}";\n`,
  );
  console.log("  ✓ src/server/pdf/logo-base64.ts");

  console.log("\nAll assets generated successfully!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
