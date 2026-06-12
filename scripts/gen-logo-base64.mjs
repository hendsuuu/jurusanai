import sharp from "sharp";
import { resolve } from "path";
import { writeFileSync } from "fs";

const src = resolve("public/logo.png");
const out = resolve("src/server/pdf/logo-base64.ts");

const buf = await sharp(src)
  .resize(64, 64, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toBuffer();

const b64 = buf.toString("base64");
const dataUri = `data:image/png;base64,${b64}`;

console.log(`Logo resized: ${buf.length} bytes, base64: ${b64.length} chars`);

writeFileSync(out, `/** Auto-generated 64x64 logo for PDF/email embedding */\nexport const LOGO_BASE64 = "${dataUri}";\n`);
console.log(`Written to: ${out}`);
