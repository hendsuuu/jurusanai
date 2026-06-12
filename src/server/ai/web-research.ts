import { env } from "@/lib/env";
import { logger } from "@/server/utils/logger";
import type { BusinessTemplate, UserPlannerInput } from "@/server/business/types";

export type WebResearchResult = {
  status: "success" | "fallback";
  data: string;
};

/**
 * Perform web research for business plan generation.
 * Uses OpenAI gpt-5.4-mini with web_search tool to get real market data.
 * Falls back gracefully if it fails — business plan still generates without it.
 */
export async function researchForBusinessPlan(args: {
  userInput: UserPlannerInput;
  template: BusinessTemplate;
}): Promise<WebResearchResult> {
  if (!env.OPENAI_API_KEY) {
    return { status: "fallback", data: buildFallbackData(args) };
  }

  try {
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      timeout: 15_000, // 15s timeout — generous but won't block forever
    });

    const query = buildSearchQuery(args);

    logger.info(`[web-research] Searching market data for ${args.template.name}...`);

    const response = await (openai as unknown as { responses: { create: (params: unknown) => Promise<unknown> } }).responses.create({
      model: "gpt-5.4-mini",
      tools: [{ type: "web_search" }],
      tool_choice: "auto",
      input: query,
    });

    const outputText = typeof (response as { output_text?: string }).output_text === "string"
      ? (response as { output_text: string }).output_text
      : "";

    if (!outputText || outputText.length < 50) {
      logger.warn("[web-research] Empty or too short response, using fallback");
      return { status: "fallback", data: buildFallbackData(args) };
    }

    logger.info(`[web-research] Got ${outputText.length} chars of market data`);
    return { status: "success", data: outputText };
  } catch (error) {
    logger.warn("[web-research] Failed, using fallback", (error as Error).message);
    return { status: "fallback", data: buildFallbackData(args) };
  }
}

function buildSearchQuery(args: { userInput: UserPlannerInput; template: BusinessTemplate }): string {
  const { userInput, template } = args;
  const products = template.products.map((p) => p.name).join(", ");

  return `Cari informasi terbaru tentang bisnis ${template.name} (kategori ${template.category}) di Indonesia, khususnya di kota ${userInput.locationCity}.

Yang perlu dicari:
1. Harga bahan baku terkini untuk produk: ${products}
2. Harga sewa tempat/booth di area ${userInput.areaType} kota ${userInput.locationCity}
3. Tren permintaan bisnis ${template.category} di Indonesia 2025-2026
4. Rata-rata harga jual kompetitor untuk produk sejenis

Berikan data dalam format ringkas dengan menyebutkan sumber dan tahun data. Fokus pada data yang bisa membantu validasi estimasi bisnis.`;
}

function buildFallbackData(args: { userInput: UserPlannerInput; template: BusinessTemplate }): string {
  const { userInput, template } = args;
  return `Data pasar berbasis estimasi internal (belum divalidasi web):
- Lokasi: ${userInput.locationCity} (${userInput.areaType})
- Kategori: ${template.category}
- Harga produk: berdasarkan template internal JuruScope
- Catatan: Semua angka perlu divalidasi dengan harga supplier dan kondisi pasar nyata di lokasi target.
- Sumber: Template internal JuruScope, estimasi konservatif berdasarkan benchmark UMKM sejenis.`;
}
