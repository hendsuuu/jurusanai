/**
 * Test: OpenAI recommendation generation with gpt-5.4-mini
 * Run: node --env-file=.env scripts/test-openai-recs.mjs
 */
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.AI_RECOMMENDATION_MODEL || "gpt-5.4-mini";

if (!apiKey) { console.error("❌ OPENAI_API_KEY not set"); process.exit(1); }

const openai = new OpenAI({ apiKey });

const prompt = `Kamu adalah AI Business Advisor untuk platform BisnisApa AI.
Berikan 4 rekomendasi ide bisnis UMKM yang realistis.

Profil User:
- Modal: Rp5-10 juta
- Kota: Semarang
- Area: kampus
- Minat: F&B
- Model jualan: pre-order
- Waktu: 3-5 jam/hari
- Target income: Rp3-5 juta/bulan
- Risiko: sedang
- Aset/skill: bisa masak, punya dapur

Return valid JSON:
{
  "recommendations": [
    {
      "businessId": "unique-slug",
      "businessName": "Nama Bisnis",
      "matchScore": 80,
      "reason": "Alasan singkat",
      "estimatedInitialCapitalRange": "Rp3.000.000 - Rp7.000.000",
      "estimatedMarginRange": "30% - 50%",
      "estimatedMonthlyProfitRange": "Rp2.000.000 - Rp5.000.000",
      "estimatedPaybackPeriod": "2 - 4 bulan",
      "riskLevel": "Sedang",
      "whyItFits": ["alasan 1", "alasan 2"],
      "thingsToPrepare": ["persiapan 1", "persiapan 2", "persiapan 3"]
    }
  ]
}`;

console.log(`Model: ${model}`);
console.log("Sending...");
const start = Date.now();

try {
  const res = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: "Berikan 4 rekomendasi ide bisnis. Output JSON saja." },
    ],
    temperature: 0.8,
    max_completion_tokens: 3000,
    response_format: { type: "json_object" },
  });

  const elapsed = Date.now() - start;
  const content = res.choices[0]?.message?.content;
  console.log(`✅ ${elapsed}ms, ${res.usage?.total_tokens ?? "?"} tokens\n`);

  const parsed = JSON.parse(content);
  console.log(`Got ${parsed.recommendations?.length ?? 0} recommendations:\n`);
  for (const r of (parsed.recommendations || [])) {
    console.log(`  • ${r.businessName} (score: ${r.matchScore})`);
    console.log(`    ${r.reason}`);
    console.log(`    Modal: ${r.estimatedInitialCapitalRange}, Profit: ${r.estimatedMonthlyProfitRange}`);
    console.log("");
  }
} catch (err) {
  console.error("❌", err.message);
  if (err.status) console.error("  Status:", err.status);
}
