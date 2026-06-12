/**
 * Test: OpenAI business plan generation with the new prompt builder
 * Run: node --env-file=.env scripts/test-openai-plan.mjs
 */
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.AI_PLAN_MODEL || "gpt-5-mini";
if (!apiKey) { console.error("❌ OPENAI_API_KEY not set"); process.exit(1); }

const openai = new OpenAI({ apiKey });

// Simplified version of the prompt builder output
const systemPrompt = `Kamu adalah AI Business Planner Indonesia. Buat business plan UMKM dalam format JSON.

DATA BISNIS:
- Nama: Rice Bowl Pre-order
- Ide: Rice bowl rumahan dengan sistem pre-order via WhatsApp
- Lokasi: Semarang (kampus)
- Modal: Rp6.000.000
- Model jualan: pre-order
- Produk: Chicken Teriyaki Rice Bowl: jual Rp18.000, HPP Rp9.500, margin 47.2%, target 25/hari
- Hari operasional: 26/bulan
- Omzet bulanan: Rp11.700.000
- Laba bersih: Rp5.086.000
- Balik modal: 1.18 bulan

ATURAN:
- Bahasa Indonesia profesional
- JANGAN ubah angka finansial
- Angka rupiah dalam number
- Output HARUS mengikuti EXACT JSON structure di bawah

OUTPUT JSON (isi semua field):
{
  "cover": {
    "title": "string",
    "business_name": "Rice Bowl Pre-order",
    "business_idea": "string",
    "location": "Semarang (kampus)",
    "business_model": "pre-order",
    "short_summary": "string"
  },
  "business_snapshot": {
    "overview": "string",
    "key_metrics": [
      {"label": "Modal Awal", "value": "Rp6.000.000", "note": "string"},
      {"label": "Omzet/Bulan", "value": "Rp11.700.000", "note": "string"},
      {"label": "Laba Bersih/Bulan", "value": "Rp5.086.000", "note": "string"},
      {"label": "Balik Modal", "value": "1.18 bulan", "note": "string"}
    ],
    "strategic_summary": "string"
  },
  "problem_opportunity_target_market": {
    "problems": ["string", "string"],
    "opportunities": [{"factor": "string", "explanation": "string"}],
    "target_segments": [{"segment": "string", "need": "string", "how_to_reach": "string"}],
    "customer_persona": {"name": "string", "profile": "string", "main_problem": "string", "buying_reason": "string"}
  },
  "product_strategy": {
    "products": [{"name": "Chicken Teriyaki Rice Bowl", "description": "string", "selling_price": 18000, "estimated_hpp": 9500, "gross_profit_per_unit": 8500, "gross_margin_percentage": 47.2}],
    "value_proposition": ["string", "string"],
    "differentiation": [{"aspect": "string", "strategy": "string"}],
    "menu_development_plan": [{"phase": "Bulan 1-2", "focus": "string"}]
  },
  "business_model_sales_funnel": {
    "revenue_streams": [{"source": "string", "explanation": "string"}],
    "sales_flow": ["string", "string", "string"],
    "sales_funnel": [{"stage": "Awareness", "activity": "string", "target": "string"}],
    "pricing_strategy": [{"strategy": "string", "explanation": "string"}]
  },
  "operational_plan": {
    "operational_flow": [{"activity": "string", "ideal_time": "string", "note": "string"}],
    "production_sop": ["string", "string", "string"],
    "initial_operational_needs": [{"item": "string", "function": "string"}],
    "potential_bottlenecks": [{"problem": "string", "impact": "string", "solution": "string"}]
  },
  "financial_plan": {
    "initial_capital_breakdown": [{"component": "Bahan baku awal", "amount": 1500000, "note": "string"}],
    "unit_economics": [{"product": "Chicken Teriyaki Rice Bowl", "selling_price": 18000, "hpp": 9500, "gross_profit_per_unit": 8500, "gross_margin_percentage": 47.2}],
    "daily_sales_projection": [{"product": "Chicken Teriyaki Rice Bowl", "target_units_per_day": 25, "daily_revenue": 450000, "daily_gross_profit": 212500}],
    "monthly_projection": {"operational_days": 26, "monthly_revenue": 11700000, "monthly_hpp": 6175000, "monthly_gross_profit": 5525000, "monthly_operational_cost": 1700000, "estimated_monthly_net_profit": 5086000},
    "accountability_notes": ["string", "string"]
  },
  "scenario_analysis_cashflow": {
    "break_even_estimation": [{"scenario": "Normal", "monthly_net_profit": 5086000, "estimated_payback_period": "1.18 bulan"}],
    "sales_scenarios": [{"scenario": "Konservatif", "units_per_day": "70%", "monthly_revenue_estimation": "Rp8.190.000", "note": "string"}],
    "cashflow_rules": ["string", "string"],
    "financial_kpis": [{"kpi": "string", "target": "string"}]
  },
  "marketing_plan_30_days": [
    {"week": "Minggu 1", "focus": "string", "activities": [{"activity": "string", "expected_output": "string"}], "target": "string"},
    {"week": "Minggu 2", "focus": "string", "activities": [{"activity": "string", "expected_output": "string"}], "target": "string"}
  ],
  "risk_mitigation_validation": {
    "risks": [{"risk": "string", "impact": "string", "mitigation": "string"}],
    "validation_plan": [{"validation_area": "string", "target": "string"}],
    "decision_rules": [{"condition": "string", "decision": "string"}]
  },
  "execution_roadmap": {
    "roadmap_90_days": [{"period": "Minggu 1-2", "focus": "string", "target": "string"}],
    "execution_checklist": [{"area": "string", "checklist": "string"}],
    "strategic_recommendation": "string",
    "final_verdict": "string",
    "disclaimer": "string"
  }
}

Ganti semua "string" dengan konten nyata Bahasa Indonesia. Angka yang sudah terisi JANGAN diubah.`;

console.log(`Model: ${model}`);
console.log("Sending business plan request...");
const start = Date.now();

try {
  const res = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Isi semua field string dengan konten bisnis nyata. Output HANYA JSON valid." },
    ],
    temperature: 0.7,
    max_completion_tokens: 6000,
    response_format: { type: "json_object" },
  });

  const elapsed = Date.now() - start;
  const content = res.choices[0]?.message?.content;
  console.log(`✅ ${elapsed}ms, ${res.usage?.total_tokens ?? "?"} tokens, ${content?.length ?? 0} chars\n`);

  const parsed = JSON.parse(content);

  // Check key fields exist
  const checks = [
    ["cover.title", parsed.cover?.title],
    ["business_snapshot.overview", parsed.business_snapshot?.overview],
    ["product_strategy.products", parsed.product_strategy?.products?.length],
    ["financial_plan.monthly_projection", parsed.financial_plan?.monthly_projection?.monthly_revenue],
    ["marketing_plan_30_days", Array.isArray(parsed.marketing_plan_30_days)],
    ["execution_roadmap.final_verdict", parsed.execution_roadmap?.final_verdict],
  ];

  console.log("Field checks:");
  for (const [name, val] of checks) {
    const ok = val !== undefined && val !== null && val !== false;
    console.log(`  ${ok ? "✅" : "❌"} ${name}: ${ok ? "present" : "MISSING"}`);
  }

  console.log("\nCover:", parsed.cover?.title);
  console.log("Verdict:", parsed.execution_roadmap?.final_verdict?.slice(0, 100));
} catch (err) {
  console.error("❌", err.message);
  if (err.status) console.error("  Status:", err.status);
}
