/**
 * Quick test: call OpenAI gpt-5.4-mini to generate a business plan.
 * Run: node --env-file=.env scripts/test-openai.mjs
 */
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("❌ OPENAI_API_KEY not set in .env");
  process.exit(1);
}

console.log(`API Key: ${apiKey.substring(0, 12)}...`);
console.log("Model: gpt-5.4-mini");
console.log("");

const openai = new OpenAI({ apiKey });

const systemPrompt = `Kamu adalah AI Business Planner. Buat business plan singkat dalam format JSON.
Data: Bisnis Rice Bowl Pre-order, lokasi Semarang (kampus), modal Rp6.000.000, model pre-order via WA.
Produk: Chicken Teriyaki Rice Bowl (Rp18.000, HPP Rp9.500, target 25/hari).

Return JSON dengan minimal fields:
{
  "cover": { "title": "", "business_name": "", "business_idea": "", "location": "", "business_model": "", "short_summary": "" },
  "business_snapshot": { "overview": "", "key_metrics": [{"label":"","value":"","note":""}], "strategic_summary": "" }
}
Gunakan Bahasa Indonesia. Angka dalam number.`;

console.log("Sending request...");
const start = Date.now();

try {
  const response = await openai.chat.completions.create({
    model: "gpt-5.4-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Buatkan business plan ringkas. Output JSON saja." },
    ],
    temperature: 0.7,
    max_completion_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const elapsed = Date.now() - start;
  const content = response.choices[0]?.message?.content;

  console.log(`✅ Response in ${elapsed}ms`);
  console.log(`Tokens: ${response.usage?.total_tokens ?? "?"}`);
  console.log("");
  console.log("Output:");
  console.log(content);
} catch (err) {
  console.error("❌ Error:", err.message);
  if (err.status) console.error("  Status:", err.status);
  if (err.error) console.error("  Detail:", JSON.stringify(err.error));
}
