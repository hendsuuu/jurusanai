import { env } from "@/lib/env";
import { logger } from "@/server/utils/logger";
import type {
  BusinessTemplate,
  FinancialProjection,
  UserPlannerInput,
} from "@/server/business/types";

export type MarketEvidenceItem = {
  label: string;
  value: string;
  note: string;
  sourceTitle?: string;
  sourceUrl?: string;
};

export type MarketResearchSource = {
  title: string;
  url: string;
  domain: string;
};

export type MarketResearchSnapshot = {
  status: "fresh" | "fallback" | "unavailable";
  summary: string;
  generatedAt: string;
  sources: MarketResearchSource[];
  signals: MarketEvidenceItem[];
};

type MatchedTemplate = {
  template: BusinessTemplate;
  score: number;
  projection: FinancialProjection;
};

const TRUSTED_MARKET_DOMAINS = [
  "bi.go.id",
  "bps.go.id",
  "webapi.bps.go.id",
  "data.badanpangan.go.id",
  "satudata.kemendag.go.id",
  "kemendag.go.id",
];

export async function researchMarketForRecommendations(args: {
  userInput: UserPlannerInput;
  matched: MatchedTemplate[];
}): Promise<MarketResearchSnapshot> {
  // Web research disabled — always use fallback from internal templates.
  // This avoids timeout issues on serverless and keeps response fast.
  return fallbackMarketResearch(args);
}

function buildMarketResearchPrompt(args: {
  userInput: UserPlannerInput;
  matched: MatchedTemplate[];
}) {
  const candidates = args.matched
    .slice(0, 5)
    .map(({ template }) => {
      const products = template.products
        .map((p) => `${p.name} jual Rp${p.sellingPrice}, HPP Rp${p.hpp}`)
        .join("; ");
      const capital = template.capitalItems
        .map((c) => `${c.name} Rp${c.amount}`)
        .join("; ");
      return `- ${template.name} (${template.category}): produk ${products}; modal ${capital}`;
    })
    .join("\n");

  return `Cari data pasar Indonesia terbaru untuk membantu rekomendasi UMKM.

Profil user:
- Kota: ${args.userInput.locationCity}
- Area: ${args.userInput.areaType}
- Minat: ${args.userInput.categoryInterest}
- Modal: ${args.userInput.capitalRange}
- Model jualan: ${args.userInput.sellingModel ?? "belum ditentukan"}

Kandidat baseline dari kalkulator internal:
${candidates}

Gunakan sumber resmi atau sangat tepercaya jika tersedia, terutama BI/PIHPS, BPS, Badan Pangan Nasional, dan Kemendag. Fokus pada harga bahan pokok, bahan baku, perlengkapan awal, atau sinyal permintaan yang relevan. Jangan mengarang angka jika sumber tidak mendukung.

Output HANYA JSON valid:
{
  "summary": "1 kalimat ringkas tentang kualitas data yang ditemukan",
  "signals": [
    {
      "label": "nama item/sinyal",
      "value": "harga/rentang/indikator singkat",
      "note": "kenapa relevan untuk rekomendasi UMKM",
      "sourceTitle": "judul sumber",
      "sourceUrl": "https://..."
    }
  ],
  "sources": [
    { "title": "judul sumber", "url": "https://...", "domain": "domain.go.id" }
  ]
}`;
}

export function fallbackMarketResearch(args: {
  userInput: UserPlannerInput;
  matched: MatchedTemplate[];
}): MarketResearchSnapshot {
  const best = args.matched[0];
  if (!best) {
    return {
      status: "unavailable",
      summary: "Data pasar eksternal belum tersedia untuk profil ini.",
      generatedAt: new Date().toISOString(),
      sources: [],
      signals: [],
    };
  }

  const productSignals = best.template.products.slice(0, 2).map((product) => ({
    label: product.name,
    value: `Jual Rp${product.sellingPrice.toLocaleString("id-ID")} / HPP Rp${product.hpp.toLocaleString("id-ID")}`,
    note: "Baseline dari template internal, perlu divalidasi dengan supplier lokal.",
    sourceTitle: "Template internal JuruScope",
    sourceUrl: "/examples",
  }));

  return {
    status: "fallback",
    summary:
      "Riset web belum tersedia, rekomendasi memakai baseline template internal.",
    generatedAt: new Date().toISOString(),
    sources: [
      {
        title: "Template internal JuruScope",
        url: "/examples",
        domain: "juruscope.id",
      },
    ],
    signals: productSignals,
  };
}

function parseMarketResearchJson(text: string): {
  summary?: string;
  signals: MarketEvidenceItem[];
  sources: MarketResearchSource[];
} {
  try {
    const json = JSON.parse(extractJson(text)) as {
      summary?: unknown;
      signals?: unknown;
      sources?: unknown;
    };
    return {
      summary: typeof json.summary === "string" ? json.summary : undefined,
      signals: Array.isArray(json.signals)
        ? json.signals.map(normalizeSignal).filter(isMarketEvidenceItem)
        : [],
      sources: Array.isArray(json.sources)
        ? json.sources.map(normalizeSource).filter(isMarketResearchSource)
        : [],
    };
  } catch (error) {
    logger.warn("[market-research] Failed to parse research JSON", error);
    return { signals: [], sources: [] };
  }
}

function isMarketEvidenceItem(
  value: MarketEvidenceItem | null
): value is MarketEvidenceItem {
  return value !== null;
}

function isMarketResearchSource(
  value: MarketResearchSource | null
): value is MarketResearchSource {
  return value !== null;
}

function normalizeSignal(value: unknown): MarketEvidenceItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const label = typeof item.label === "string" ? item.label : "";
  const signalValue = typeof item.value === "string" ? item.value : "";
  const note = typeof item.note === "string" ? item.note : "";
  if (!label || !signalValue || !note) return null;
  return {
    label,
    value: signalValue,
    note,
    sourceTitle:
      typeof item.sourceTitle === "string" ? item.sourceTitle : undefined,
    sourceUrl: typeof item.sourceUrl === "string" ? item.sourceUrl : undefined,
  };
}

function normalizeSource(value: unknown): MarketResearchSource | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const url = typeof item.url === "string" ? item.url : "";
  if (!url) return null;
  return {
    title: typeof item.title === "string" ? item.title : getDomain(url),
    url,
    domain:
      typeof item.domain === "string" ? item.domain.replace(/^https?:\/\//, "") : getDomain(url),
  };
}

function collectResponseSources(response: unknown): MarketResearchSource[] {
  const output = (response as { output?: unknown }).output;
  if (!Array.isArray(output)) return [];

  const sources: MarketResearchSource[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const action = record.action;
    if (action && typeof action === "object") {
      const actionSources = (action as Record<string, unknown>).sources;
      if (Array.isArray(actionSources)) {
        for (const source of actionSources) {
          const normalized = normalizeSource(source);
          if (normalized) sources.push(normalized);
        }
      }
    }

    const content = record.content;
    if (Array.isArray(content)) {
      for (const contentItem of content) {
        if (!contentItem || typeof contentItem !== "object") continue;
        const annotations = (contentItem as Record<string, unknown>).annotations;
        if (!Array.isArray(annotations)) continue;
        for (const annotation of annotations) {
          const normalized = normalizeSource(annotation);
          if (normalized) sources.push(normalized);
        }
      }
    }
  }
  return sources;
}

function mergeSources(
  primary: MarketResearchSource[],
  secondary: MarketResearchSource[]
) {
  const seen = new Set<string>();
  const merged: MarketResearchSource[] = [];
  for (const source of [...primary, ...secondary]) {
    if (!source.url || seen.has(source.url)) continue;
    seen.add(source.url);
    merged.push(source);
  }
  return merged;
}

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed;
  const match = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (match) return match[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0] ?? "";
  }
}
