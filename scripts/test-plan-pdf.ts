/**
 * Test: generate a mock business plan and render it to PDF.
 * Run: npx tsx scripts/test-plan-pdf.ts
 */

// Set required env vars before any imports
process.env.DATABASE_URL = "postgresql://x:x@localhost:5432/x";
process.env.AUTH_SECRET = "test-secret-32-chars-minimum-ok";
process.env.NODE_ENV = "development";

import { generateBusinessPlan } from "../src/server/ai/client";
import { businessTemplates } from "../src/server/business/templates";
import { calculateFinancialProjection } from "../src/server/business/calculator";
import { renderPlanHtml } from "../src/server/pdf/pdf-template";
import type { UserPlannerInput } from "../src/server/business/types";
import type { BusinessPlan } from "@prisma/client";
import { writeFileSync } from "fs";
import { resolve } from "path";

async function main() {
  const template = businessTemplates[0]; // Rice Bowl Pre-order
  const projection = calculateFinancialProjection(template);

  const userInput: UserPlannerInput = {
    capitalRange: "Rp5-10 juta",
    locationCity: "Semarang",
    areaType: "kampus",
    categoryInterest: "F&B",
    sellingModel: "pre-order",
    availableTime: "3-5 jam/hari",
    targetIncome: "Rp3-5 juta/bulan",
    riskPreference: "sedang",
    assets: ["bisa masak", "punya dapur"],
  };

  console.log("Generating business plan...");
  const aiPlan = await generateBusinessPlan({ userInput, template, projection });

  console.log("Cover:", aiPlan.cover.title);
  console.log("Verdict:", aiPlan.execution_roadmap.final_verdict.slice(0, 100) + "...");
  console.log("Products:", aiPlan.product_strategy.products.length);
  console.log("Marketing weeks:", aiPlan.marketing_plan_30_days.length);
  console.log("Risks:", aiPlan.risk_mitigation_validation.risks.length);

  // Render HTML
  const fakePlan = {
    id: "test-plan-id",
    selectedIdeaName: template.name,
    locationCity: userInput.locationCity,
    areaType: userInput.areaType,
  } as unknown as BusinessPlan;

  const html = renderPlanHtml({ plan: fakePlan, ai: aiPlan, projection });
  const outPath = resolve(process.cwd(), "test-plan-output.html");
  writeFileSync(outPath, html);
  console.log(`\n✅ HTML rendered: ${outPath} (${html.length} chars)`);
  console.log("Open in browser to preview, or run Puppeteer to convert to PDF.");
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});
