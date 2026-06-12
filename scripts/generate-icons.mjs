/**
 * Generate favicon and various icon sizes from logo.png for SEO best practices.
 * Run: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { resolve } from "path";
import { mkdirSync } from "fs";

const SOURCE = resolve("public/logo.png");
const OUT_DIR = resolve("public");
const APP_DIR = resolve("src/app");

// Ensure directories exist
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(APP_DIR, { recursive: true });

const sizes = [
  // Favicons
  { name: "favicon-16x16.png", size: 16, dir: OUT_DIR },
  { name: "favicon-32x32.png", size: 32, dir: OUT_DIR },
  // Apple touch icon
  { name: "apple-touch-icon.png", size: 180, dir: OUT_DIR },
  // Android/PWA icons
  { name: "icon-192.png", size: 192, dir: OUT_DIR },
  { name: "icon-512.png", size: 512, dir: OUT_DIR },
  // Next.js App Router icon convention (placed in src/app/)
  { name: "icon.png", size: 32, dir: APP_DIR },
  { name: "apple-icon.png", size: 180, dir: APP_DIR },
];

async function main() {
  console.log(`Source: ${SOURCE}`);
  console.log("");

  for (const { name, size, dir } of sizes) {
    const outPath = resolve(dir, name);
    await sharp(SOURCE)
      .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(outPath);
    console.log(`✅ ${name} (${size}x${size}) → ${outPath}`);
  }

  // Generate ICO (favicon.ico) — 16x16 and 32x32 combined
  // Sharp doesn't natively output .ico, so we'll create a simple PNG favicon
  // Next.js App Router supports favicon via src/app/favicon.ico or icon.png
  const faviconPath = resolve(APP_DIR, "favicon.ico");
  await sharp(SOURCE)
    .resize(32, 32, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(faviconPath);
  console.log(`✅ favicon.ico (32x32 PNG) → ${faviconPath}`);

  // OG Image (1200x630) — white bg with centered logo
  const ogPath = resolve(OUT_DIR, "og-image.png");
  const logoResized = await sharp(SOURCE)
    .resize(200, 200, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 248, g: 250, b: 252, alpha: 255 },
    },
  })
    .composite([
      {
        input: logoResized,
        top: 215,
        left: 500,
      },
    ])
    .png()
    .toFile(ogPath);
  console.log(`✅ og-image.png (1200x630) → ${ogPath}`);

  console.log("\nDone! Icons generated for SEO best practices.");
}

main().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
