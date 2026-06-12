/**
 * Test gpt-5 recommendation call (no temperature, no response_format)
 * Run: node --env-file=.env scripts/test-gpt5-recs.mjs
 */
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.AI_RECOMMENDATION_MODEL || "gpt-5";
if (!apiKey) { console.error("❌ OPENAI_API_KEY not set"); process.exit(1); }

const openai = new OpenAI({ apiKey });

console.log(`Model: ${model}`);
console.log(`Is reasoning model: ${model === "gpt-5" || model.startsWith("o")}`);
console.log("Sending (no temperature, no response_format)...\n");

const start = Date.now();

try {
  const res = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `Kamu adalah AI Business Advisor. Berikan 2 rekomendasi ide bisnis untuk user dengan modal Rp5 juta di area kampus Semarang, minat F&B. Output HANYA JSON valid: {"recommendations": [{"businessId": "slug", "businessName": "Nama", "matchScore": 80, "reason": "alasan", "estimatedInitialCapitalRange": "Rp3-7jt", "estimatedMarginRange": "30-50%", "estimatedMonthlyProfitRange": "Rp2-5jt", "estimatedPaybackPeriod": "2-4 bulan", "riskLevel": "Sedang", "whyItFits": ["a"], "thingsToPrepare": ["b"]}]}`
      },
      { role: "user", content: "Berikan 2 rekomendasi. Output JSON saja." },
    ],
    max_completion_tokens: 16000,
  });

  const elapsed = Date.now() - start;
  const content = res.choices?.[0]?.message?.content;
  
  console.log(`Response in ${elapsed}ms`);
  console.log(`Finish reason: ${res.choices?.[0]?.finish_reason}`);
  console.log(`Content length: ${content?.length ?? 0}`);
  console.log(`Content null: ${content === null}`);
  console.log(`Usage:`, res.usage);
  console.log("");
  
  if (content) {
    console.log("✅ Got content:");
    console.log(content.slice(0, 500));
  } else {
    console.log("❌ Content is null/empty");
    console.log("Full message:", JSON.stringify(res.choices?.[0]?.message, null, 2));
  }
} catch (err) {
  console.error("❌ Error:", err.message);
  if (err.status) console.error("  Status:", err.status);
  if (err.error) console.error("  Detail:", JSON.stringify(err.error, null, 2));
}
