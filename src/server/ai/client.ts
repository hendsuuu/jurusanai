import { env } from "@/lib/env";
import { logger } from "@/server/utils/logger";
import {
  aiPersonalityResponseSchema,
  aiSelfDiscoveryReportSchema,
} from "./schemas";
import { personalityResultPrompt } from "./prompts";
import { buildReportPrompt } from "./plan-prompt-builder";
import type {
  AiPersonalityResponse,
  AiPersonalityResult,
  AiSelfDiscoveryReport,
} from "./schemas";
import type { UserPlannerInput } from "@/server/business/types";

// ─── Public types ─────────────────────────────────────────────────────────

export type GeneratePersonalityArgs = {
  userInput: UserPlannerInput;
};

export type GenerateReportArgs = {
  personality: AiPersonalityResult;
  userInput: UserPlannerInput;
};

// ─── Personality result (FREE teaser) ──────────────────────────────────────

export async function generateRecommendations(
  args: GeneratePersonalityArgs
): Promise<AiPersonalityResponse> {
  const { getAiConfig } = await import("@/server/admin/ai-config.service");
  const config = await getAiConfig();

  if (config.recommendationProvider === "openai" && env.OPENAI_API_KEY) {
    try {
      return await openaiPersonality(args, config.recommendationModel);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`[AI] openaiPersonality failed — ${msg}`, {
        model: config.recommendationModel,
        provider: config.recommendationProvider,
      });
      // In production, surface the error rather than silently showing mock data.
      // In development, fall back to mock so devs without an API key can still test.
      if (env.NODE_ENV === "production") throw err;
      return mockPersonality(args);
    }
  }

  if (env.NODE_ENV === "production") {
    throw new Error(
      `AI provider '${config.recommendationProvider}' is not configured. ` +
        "Set OPENAI_API_KEY and AI_PROVIDER=openai in production environment variables."
    );
  }
  return mockPersonality(args);
}

// ─── Self Discovery Report (PAID, full) ─────────────────────────────────────

export async function generateBusinessPlan(
  args: GenerateReportArgs
): Promise<AiSelfDiscoveryReport> {
  const { getAiConfig } = await import("@/server/admin/ai-config.service");
  const config = await getAiConfig();

  if (config.planProvider === "openai" && env.OPENAI_API_KEY) {
    try {
      return await openaiReport(args, config.planModel);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`[AI] openaiReport failed — ${msg}`, {
        model: config.planModel,
        provider: config.planProvider,
      });
      if (env.NODE_ENV === "production") throw err;
      return mockReport(args);
    }
  }

  if (env.NODE_ENV === "production") {
    throw new Error(
      `AI provider '${config.planProvider}' is not configured for plan generation.`
    );
  }
  return mockReport(args);
}

// ─── OpenAI: Personality ────────────────────────────────────────────────────

function buildAnswerSummary(userInput: UserPlannerInput): string {
  const parts: string[] = [];
  if (userInput.ageRange) parts.push(`rentang umur ${userInput.ageRange}`);
  if (userInput.categoryInterest) parts.push(`bidang ${userInput.categoryInterest}`);
  if (userInput.assets.length > 0) parts.push(`menonjol di ${userInput.assets.join(", ")}`);
  if (userInput.riskPreference) parts.push(`gaya menghadapi tantangan ${userInput.riskPreference}`);
  if (userInput.availableTime) parts.push(`pola energi ${userInput.availableTime}`);
  if (userInput.sellingModel) parts.push(`cara berkarya ${userInput.sellingModel}`);
  return parts.length > 0 ? parts.join("; ") : "jawaban beragam tanpa dominasi jelas";
}

async function openaiPersonality(
  args: GeneratePersonalityArgs,
  modelOverride?: string
): Promise<AiPersonalityResponse> {
  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const model = modelOverride || env.AI_RECOMMENDATION_MODEL;

  const { userInput } = args;
  const ageGrade = userInput.ageRange || "rentang umur belum disebutkan";
  const displayName = userInput.locationCity || "Siswa";

  const filledPrompt = personalityResultPrompt
    .replace("{{name}}", displayName)
    .replace("{{age_grade}}", ageGrade)
    .replace("{{answer_summary}}", buildAnswerSummary(userInput))
    .replace(
      "{{interest_notes}}",
      [
        userInput.categoryInterest ? `Minat: ${userInput.categoryInterest}` : "",
        userInput.assets.length ? `Aset: ${userInput.assets.join(", ")}` : "",
        userInput.ageRange ? `Rentang umur: ${userInput.ageRange}` : "",
        userInput.locationCity ? `Nama: ${userInput.locationCity}` : "",
      ]
        .filter(Boolean)
        .join(". ") || "Tidak ada catatan tambahan."
    );

  // Only OpenAI o-series (o1, o3, o4, o4-mini …) are "reasoning" models —
  // they require no response_format and use max_completion_tokens differently.
  // GPT-series (gpt-4o, gpt-5, gpt-5-mini) are standard chat models and MUST
  // use response_format: json_object to guarantee clean JSON output.
  const isReasoningModel = /^o\d/i.test(model);

  const createParams: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: filledPrompt },
      {
        role: "user",
        content: `Analisis profil di atas dan hasilkan personality result teaser.
ATURAN OUTPUT: HANYA JSON valid (mulai { akhiri }). Property pakai double quote. Tanpa trailing comma. Tanpa markdown.`,
      },
    ],
    max_completion_tokens: isReasoningModel ? 12000 : 4000,
  };
  if (!isReasoningModel) createParams.response_format = { type: "json_object" };

  logger.info(`[OpenAI] Generating personality with ${model}...`);

  const response = (await openai.chat.completions.create(
    createParams as unknown as Parameters<typeof openai.chat.completions.create>[0]
  )) as unknown as {
    choices: Array<{ message: { content: string | null }; finish_reason: string }>;
  };

  const content = response.choices[0]?.message?.content ?? "";
  if (!content) throw new Error("OpenAI returned empty personality response");

  const jsonStr = extractJson(content);
  let parsed: unknown;
  try {
    parsed = safeJsonParse(jsonStr, "personality");
  } catch (parseErr) {
    try {
      parsed = safeJsonParse(repairTruncatedJson(jsonStr), "personality-repaired");
    } catch {
      throw parseErr;
    }
  }

  const validated = aiPersonalityResponseSchema.parse(parsed);
  // Keep only top 3 jurusan for the free teaser.
  if (validated.result.topJurusan.length > 3) {
    validated.result.topJurusan = validated.result.topJurusan.slice(0, 3);
  }
  logger.info(`[OpenAI] Personality validated: ${validated.result.personalityTitle}`);
  return validated;
}

// ─── OpenAI: Report ─────────────────────────────────────────────────────────

async function openaiReport(
  args: GenerateReportArgs,
  modelOverride?: string
): Promise<AiSelfDiscoveryReport> {
  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const model = modelOverride || env.AI_PLAN_MODEL;

  const systemPrompt = buildReportPrompt({
    personality: args.personality,
    userInput: args.userInput,
  });

  // Same reasoning-model rule as openaiPersonality: only o-series qualifies.
  const isReasoningModel = /^o\d/i.test(model);

  const createParams: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Isi semua field "string" dengan konten self discovery nyata Bahasa Indonesia. Output HANYA JSON valid, tanpa markdown atau teks lain.`,
      },
    ],
    max_completion_tokens: isReasoningModel ? 40000 : 8000,
  };
  if (!isReasoningModel) createParams.response_format = { type: "json_object" };

  logger.info(`[OpenAI] Generating self discovery report with ${model}...`);

  const response = (await openai.chat.completions.create(
    createParams as unknown as Parameters<typeof openai.chat.completions.create>[0]
  )) as unknown as {
    choices: Array<{ message: { content: string | null }; finish_reason: string }>;
  };

  const content = response.choices[0]?.message?.content ?? "";
  if (!content) throw new Error("OpenAI returned empty report response");

  const jsonStr = extractJson(content);
  let parsed: unknown;
  try {
    parsed = safeJsonParse(jsonStr, "report");
  } catch (parseErr) {
    try {
      parsed = safeJsonParse(repairTruncatedJson(jsonStr), "report-repaired");
    } catch {
      throw parseErr;
    }
  }

  const strict = aiSelfDiscoveryReportSchema.safeParse(parsed);
  if (strict.success) {
    logger.info("[OpenAI] Report validated (strict)");
    return strict.data;
  }

  logger.warn(
    `[OpenAI] Report strict validation failed (${strict.error.issues.length} issues), patching...`
  );
  const patched = patchReport(parsed as Record<string, unknown>, args);
  const patchResult = aiSelfDiscoveryReportSchema.safeParse(patched);
  if (patchResult.success) {
    logger.info("[OpenAI] Report validated after patching");
    return patchResult.data;
  }

  logger.error("[OpenAI] Report patch failed, issues:", patchResult.error.issues.slice(0, 5));
  throw patchResult.error;
}

/** Fill missing top-level report sections from the mock generator. */
function patchReport(
  partial: Record<string, unknown>,
  args: GenerateReportArgs
): Record<string, unknown> {
  const fallback = mockReport(args) as unknown as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(fallback)) {
    if (partial[key] === undefined || partial[key] === null) {
      result[key] = fallback[key];
    } else if (
      typeof partial[key] === "object" &&
      !Array.isArray(partial[key]) &&
      typeof fallback[key] === "object" &&
      !Array.isArray(fallback[key])
    ) {
      const p = partial[key] as Record<string, unknown>;
      const f = fallback[key] as Record<string, unknown>;
      const merged: Record<string, unknown> = {};
      for (const sub of Object.keys(f)) {
        merged[sub] = p[sub] !== undefined && p[sub] !== null ? p[sub] : f[sub];
      }
      result[key] = merged;
    } else {
      result[key] = partial[key];
    }
  }
  return result;
}

// ─── JSON helpers (shared) ──────────────────────────────────────────────────

function extractJson(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed;
  const match = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (match) return match[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function sanitizeJsonString(input: string): string {
  const s = input
    .replace(/^\uFEFF/, "")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u00A0\u202F\u2007]/g, " ");

  let out = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inString) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }
    if (ch === "/" && s[i + 1] === "/") {
      const eol = s.indexOf("\n", i);
      i = eol === -1 ? s.length : eol - 1;
      continue;
    }
    if (ch === "/" && s[i + 1] === "*") {
      const close = s.indexOf("*/", i + 2);
      i = close === -1 ? s.length : close + 1;
      continue;
    }
    if (ch === "'") {
      let j = i + 1;
      let escaped2 = false;
      while (j < s.length) {
        const c2 = s[j];
        if (escaped2) escaped2 = false;
        else if (c2 === "\\") escaped2 = true;
        else if (c2 === "'") break;
        j++;
      }
      if (j < s.length) {
        const inner = s
          .slice(i + 1, j)
          .replace(/\\'/g, "'")
          .replace(/"/g, '\\"');
        out += `"${inner}"`;
        i = j;
        continue;
      }
    }
    out += ch;
  }
  out = out.replace(/,(\s*[}\]])/g, "$1");
  return out;
}

function safeJsonParse(raw: string, label: string): unknown {
  try {
    return JSON.parse(raw);
  } catch (firstErr) {
    const sanitized = sanitizeJsonString(raw);
    try {
      const parsed = JSON.parse(sanitized);
      logger.warn(
        `[OpenAI:${label}] JSON needed sanitization (raw failed: ${(firstErr as Error).message})`
      );
      return parsed;
    } catch (secondErr) {
      const msg = (secondErr as Error).message;
      const posMatch = msg.match(/position (\d+)/);
      const pos = posMatch ? Number(posMatch[1]) : -1;
      if (pos > 0) {
        const start = Math.max(0, pos - 100);
        const end = Math.min(sanitized.length, pos + 100);
        logger.error(
          `[OpenAI:${label}] JSON parse failed even after sanitization. Around position ${pos}: ...${sanitized.slice(start, end)}...`
        );
      }
      throw secondErr;
    }
  }
}

function repairTruncatedJson(raw: string): string {
  let inString = false;
  let escaped = false;
  const stack: string[] = [];
  let lastSafeEnd = -1;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{" || ch === "[") {
      stack.push(ch);
      lastSafeEnd = i;
      continue;
    }
    if (ch === "}" || ch === "]") {
      stack.pop();
      lastSafeEnd = i;
      continue;
    }
    if (ch === ",") {
      lastSafeEnd = i;
      continue;
    }
    if (/\s/.test(ch)) continue;
  }

  let repaired = raw;
  if (inString) {
    repaired = repaired + '"';
    if (lastSafeEnd >= 0 && lastSafeEnd < raw.length) {
      const sliced = raw.slice(0, lastSafeEnd + 1);
      repaired = sliced.replace(/,\s*$/, "");
    }
  } else if (lastSafeEnd >= 0 && lastSafeEnd < raw.length - 1) {
    const sliced = raw.slice(0, lastSafeEnd + 1);
    repaired = sliced.replace(/,\s*$/, "");
  } else {
    repaired = raw.replace(/,\s*$/, "");
  }

  const finalStack: string[] = [];
  let st = false;
  let es = false;
  for (let i = 0; i < repaired.length; i++) {
    const ch = repaired[i];
    if (st) {
      if (es) es = false;
      else if (ch === "\\") es = true;
      else if (ch === '"') st = false;
      continue;
    }
    if (ch === '"') {
      st = true;
      continue;
    }
    if (ch === "{" || ch === "[") finalStack.push(ch);
    else if (ch === "}" || ch === "]") finalStack.pop();
  }
  while (finalStack.length > 0) {
    const opener = finalStack.pop();
    repaired += opener === "{" ? "}" : "]";
  }
  return repaired;
}

// ─── Mock: Personality (fallback / no API key) ──────────────────────────────

function pickArchetype(userInput: UserPlannerInput) {
  const text = `${userInput.categoryInterest} ${userInput.assets.join(" ")}`.toLowerCase();
  if (text.includes("desain") || text.includes("kreatif") || text.includes("fashion") || text.includes("beauty")) {
    return {
      id: "creative-strategist",
      title: "Creative Strategist",
      tagline: "Kamu mikir pakai ide, gerak pakai rasa penasaran.",
      traits: { creativity: 90, communication: 78, exploration: 82, social_intelligence: 70, logic: 60, analytical_thinking: 64, leadership: 58, stability: 50 },
      jurusan: [
        { name: "Desain Komunikasi Visual", matchPercentage: 92, reason: "Cocok untuk yang kreatif & suka mengekspresikan ide secara visual." },
        { name: "Ilmu Komunikasi", matchPercentage: 86, reason: "Pas buat kamu yang kuat di komunikasi & senang berinteraksi." },
        { name: "Desain Produk / Interior", matchPercentage: 82, reason: "Menggabungkan kreativitas dengan eksplorasi solusi nyata." },
      ],
    };
  }
  if (text.includes("digital") || text.includes("coding") || text.includes("retail") || text.includes("reseller")) {
    return {
      id: "analytical-creator",
      title: "Analytical Creator",
      tagline: "Kamu suka memecah masalah jadi langkah yang masuk akal.",
      traits: { analytical_thinking: 90, logic: 86, creativity: 70, exploration: 72, stability: 66, communication: 60, leadership: 58, social_intelligence: 55 },
      jurusan: [
        { name: "Teknik Informatika / Ilmu Komputer", matchPercentage: 91, reason: "Cocok untuk pola pikir logis dan suka membangun sistem." },
        { name: "Sistem Informasi / Bisnis Digital", matchPercentage: 85, reason: "Menggabungkan analisis dengan solusi nyata." },
        { name: "Statistika / Data Science", matchPercentage: 80, reason: "Pas buat kamu yang nyaman bekerja dengan data dan pola." },
      ],
    };
  }
  if (text.includes("jasa") || text.includes("edukasi") || text.includes("followers") || text.includes("jualan")) {
    return {
      id: "visionary-connector",
      title: "Visionary Connector",
      tagline: "Kamu hidup dari interaksi dan ide yang menular ke orang lain.",
      traits: { communication: 90, social_intelligence: 86, leadership: 78, creativity: 72, exploration: 70, logic: 58, analytical_thinking: 55, stability: 60 },
      jurusan: [
        { name: "Ilmu Komunikasi", matchPercentage: 90, reason: "Cocok untuk yang kuat berkomunikasi dan membangun relasi." },
        { name: "Psikologi", matchPercentage: 84, reason: "Pas buat kamu yang peka memahami orang lain." },
        { name: "Manajemen / Marketing", matchPercentage: 81, reason: "Menggabungkan kepemimpinan dengan pengaruh sosial." },
      ],
    };
  }
  return {
    id: "explorer-builder",
    title: "Explorer Builder",
    tagline: "Kamu belajar paling cepat saat mencoba langsung.",
    traits: { exploration: 88, creativity: 74, logic: 70, stability: 68, analytical_thinking: 66, communication: 64, leadership: 62, social_intelligence: 60 },
    jurusan: [
      { name: "Manajemen Bisnis", matchPercentage: 86, reason: "Cocok untuk yang suka mencoba banyak hal dan mengeksekusi ide." },
      { name: "Teknik Industri", matchPercentage: 82, reason: "Menggabungkan eksplorasi dengan sistem yang terstruktur." },
      { name: "Kewirausahaan", matchPercentage: 79, reason: "Pas buat kamu yang senang membangun sesuatu dari nol." },
    ],
  };
}

function mockPersonality(args: GeneratePersonalityArgs): AiPersonalityResponse {
  const a = pickArchetype(args.userInput);
  const coreTraits = [
    "creativity",
    "logic",
    "leadership",
    "communication",
    "exploration",
    "stability",
    "analytical_thinking",
    "social_intelligence",
  ].map((name) => ({
    name,
    score: (a.traits as Record<string, number>)[name] ?? 60,
  }));

  return {
    result: {
      personalityId: a.id,
      personalityTitle: a.title,
      tagline: a.tagline,
      summary:
        "Kamu cenderung punya cara berpikir yang khas dan berkembang paling baik di lingkungan yang sesuai dengan karaktermu. Hasil ini menggambarkan kecenderungan alamimu, bukan label permanen.",
      emotionalPreview:
        "Pernah merasa beda dari teman-temanmu dalam cara memandang sesuatu? Itu bukan kebetulan — itu bagian dari siapa kamu.",
      basicFutureDirection:
        "Kamu cocok di bidang yang memberi ruang untuk tumbuh sesuai kekuatan alamimu, bukan yang memaksamu jadi orang lain.",
      coreTraits,
      topJurusan: a.jurusan,
    },
  };
}

// ─── Mock: Self Discovery Report (fallback) ─────────────────────────────────

function mockReport(args: GenerateReportArgs): AiSelfDiscoveryReport {
  const p = args.personality;
  const ageContext = args.userInput.ageRange
    ? ` Di rentang umur ${args.userInput.ageRange}, rekomendasi ini disusun agar sesuai dengan fase eksplorasi dan keputusanmu sekarang.`
    : "";
  const topTraits = [...p.coreTraits].sort((a, b) => b.score - a.score).slice(0, 3);
  const jurusan =
    p.topJurusan.length > 0
      ? p.topJurusan
      : [
          { name: "Ilmu Komunikasi", matchPercentage: 88, reason: "Cocok dengan kekuatanmu." },
          { name: "Manajemen", matchPercentage: 82, reason: "Pas dengan gaya kerjamu." },
          { name: "Psikologi", matchPercentage: 78, reason: "Sesuai dengan kepekaanmu." },
        ];

  // Expand top 3 jurusan teaser into 5 for the full report.
  const fullJurusan = [
    ...jurusan.map((j) => ({
      jurusan: j.name,
      match_percentage: j.matchPercentage,
      reason: j.reason,
      career_example: "Beragam profesi yang relevan dengan bidang ini.",
    })),
    { jurusan: "Bisnis Digital", match_percentage: 74, reason: "Fleksibel dan cocok untuk berbagai kepribadian yang adaptif.", career_example: "Digital Marketer, Product Analyst" },
    { jurusan: "Hubungan Internasional", match_percentage: 70, reason: "Cocok jika kamu senang wawasan luas dan komunikasi lintas budaya.", career_example: "Diplomat, Analis Kebijakan" },
  ].slice(0, 5);

  return {
    cover: {
      title: "Self Discovery Report",
      personality_title: p.personalityTitle,
      tagline: p.tagline,
      identity_label: topTraits.map((t) => t.name).join(" + ") || "Multi-potensi",
      short_summary: `${p.summary}${ageContext}`,
    },
    personality_overview: {
      overview:
        `Sebagai ${p.personalityTitle}, kamu punya cara pandang yang khas dalam menghadapi tugas, orang, dan tantangan. ${p.summary}${ageContext}`,
      core_identity:
        "Inti dirimu terletak pada bagaimana kamu memproses dunia: kombinasi rasa ingin tahu, cara berpikir, dan cara kamu berinteraksi membentuk pola yang konsisten.",
      dominant_traits: topTraits.map((t) => ({
        trait: t.name,
        score: t.score,
        explanation: `Trait ${t.name} menonjol (${t.score}/100), memengaruhi cara kamu mengambil keputusan dan menikmati aktivitas sehari-hari.`,
      })),
      thinking_pattern:
        "Pola pikirmu cenderung menggabungkan beberapa pendekatan, sehingga kamu fleksibel namun tetap punya kecenderungan dominan yang jelas.",
    },
    strength_weakness: {
      strengths: [
        { title: "Cepat memahami hal baru", description: "Kamu menyerap konsep dan ide baru dengan relatif mudah." },
        { title: "Punya cara pandang unik", description: "Kamu sering melihat sudut yang tidak dilihat orang lain." },
        { title: "Adaptif", description: "Kamu bisa menyesuaikan diri dengan situasi yang berubah." },
      ],
      weaknesses: [
        { title: "Mudah bosan dengan rutinitas", description: "Aktivitas yang monoton bisa menurunkan motivasimu." },
        { title: "Kadang terlalu banyak ide", description: "Banyaknya ide bisa membuat fokus terpecah." },
        { title: "Perlu lingkungan yang tepat", description: "Kamu kurang berkembang di lingkungan yang terlalu kaku." },
      ],
      balancing_note:
        "Kekuatan dan kekuranganmu dua sisi dari koin yang sama. Kuncinya adalah memilih lingkungan yang memaksimalkan kelebihan dan meminimalkan pemicu kelemahanmu.",
    },
    top_jurusan_match: fullJurusan,
    career_direction: {
      summary:
        "Arah karirmu paling berkembang di bidang yang memberi ruang untuk tumbuh sesuai kekuatan alamimu.",
      paths: [
        { field: jurusan[0]?.name ?? "Bidang utama", progression: "Junior → Spesialis → Lead", explanation: "Jalur yang memungkinkan kamu mendalami keahlian inti." },
        { field: jurusan[1]?.name ?? "Bidang alternatif", progression: "Staff → Manajer → Direktur", explanation: "Jalur yang memanfaatkan kemampuan koordinasi dan strategimu." },
      ],
    },
    future_lifestyle: {
      work_style: "Kamu paling produktif saat punya kebebasan mengatur cara dan ritme kerjamu sendiri.",
      work_environment: "Lingkungan yang kolaboratif namun tidak terlalu kaku paling cocok untukmu.",
      work_pressure: "Kamu bisa menghadapi tekanan selama tujuannya jelas dan kamu punya ruang untuk berkreasi mencari solusi.",
      lifestyle_compatibility: "Gaya hidup yang seimbang antara eksplorasi dan stabilitas akan membuatmu merasa paling utuh.",
    },
    warning_area: {
      warnings: [
        { area: "Pekerjaan repetitif & monoton", explanation: "Rutinitas tanpa variasi cepat membuatmu kehilangan motivasi.", suggestion: "Cari peran yang punya elemen variasi atau proyek baru secara berkala." },
        { area: "Lingkungan terlalu kaku", explanation: "Aturan yang sangat ketat tanpa ruang inisiatif bisa membatasimu.", suggestion: "Pilih tempat yang menghargai inisiatif dan ide baru." },
      ],
    },
    self_development_advice: {
      advices: [
        { focus: "Konsistensi", why: "Kamu kuat di ide, tapi eksekusi konsisten akan melipatgandakan dampakmu.", action: "Pilih satu proyek dan selesaikan sampai tuntas bulan ini." },
        { focus: "Fokus", why: "Banyak minat bisa memecah energi.", action: "Tentukan 1-2 prioritas utama tiap semester." },
        { focus: "Skill komunikasi", why: "Ide yang baik perlu disampaikan dengan baik.", action: "Latih menjelaskan idemu secara ringkas ke orang lain." },
      ],
    },
    skill_roadmap: {
      phases: [
        { phase: "Sekarang - 6 bulan", focus: "Kenali & kuatkan dasar", skills: ["Eksplorasi minat lebih dalam", "Skill dasar di bidang yang cocok"] },
        { phase: "6 - 12 bulan", focus: "Bangun portofolio", skills: ["Proyek nyata kecil", "Belajar dari mentor/komunitas"] },
        { phase: "1 - 2 tahun", focus: "Spesialisasi", skills: ["Pendalaman keahlian", "Pengalaman kolaborasi tim"] },
      ],
    },
    closing: {
      strategic_recommendation:
        `Sebagai ${p.personalityTitle}, fokuslah pada jurusan dan lingkungan yang memberi ruang untuk kekuatan alamimu berkembang.`,
      final_note:
        "Hasil ini adalah titik awal untuk lebih mengenal dirimu. Gunakan sebagai bahan refleksi, diskusi dengan orang terdekat, dan keputusanmu sendiri.",
      disclaimer:
        "Hasil JuruScope adalah panduan untuk mengenal diri dan menentukan arah, bukan keputusan mutlak soal jurusan atau masa depan.",
    },
  };
}
