/**
 * Test PDF generation with Puppeteer.
 * Run: npx tsx scripts/test-pdf-gen.ts
 */
import puppeteer from "puppeteer";
import { writeFileSync } from "fs";
import { resolve } from "path";

const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<title>Test PDF</title>
<style>
  body { font-family: Arial, sans-serif; padding: 40px; }
  h1 { color: #2563eb; }
  .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-top: 20px; }
</style>
</head>
<body>
  <h1>BisnisApa AI - Test PDF</h1>
  <p>Ini adalah test PDF generation menggunakan Puppeteer.</p>
  <div class="card">
    <h2>Rice Bowl Pre-order</h2>
    <p>Modal: Rp6.000.000</p>
    <p>Omzet: Rp14.820.000/bulan</p>
    <p>Laba bersih: Rp5.086.000/bulan</p>
  </div>
  <p style="margin-top: 40px; font-size: 12px; color: #666;">
    Generated at: ${new Date().toISOString()}
  </p>
</body>
</html>`;

async function main() {
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  console.log("Creating page...");
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "domcontentloaded" });

  console.log("Generating PDF...");
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
  });

  await browser.close();

  const outPath = resolve(process.cwd(), "test-output.pdf");
  writeFileSync(outPath, pdfBuffer);
  console.log(`✅ PDF generated: ${outPath} (${pdfBuffer.length} bytes)`);
}

main().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
