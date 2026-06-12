import type { UserPlannerInput } from "@/server/business/types";
import type { AiPersonalityResult } from "./schemas";

/**
 * Build the full Self Discovery Report prompt (paid PDF) from the free
 * personality teaser + user context. The report MUST stay consistent with
 * the teaser the user already saw, but expands every section into full,
 * premium-quality content (PRD §21 — 8 sections).
 */
export function buildReportPrompt(args: {
  personality: AiPersonalityResult;
  userInput: UserPlannerInput;
}): string {
  const { personality, userInput } = args;

  const traitLines = personality.coreTraits
    .map((t) => `- ${t.name}: ${t.score}/100`)
    .join("\n");
  const jurusanLines = personality.topJurusan
    .map((j) => `- ${j.name} (${j.matchPercentage}%): ${j.reason}`)
    .join("\n");
  const interestNotes = buildInterestNotes(userInput);

  return `Kamu adalah AI Self Discovery untuk platform JuruScope.
Tugasmu menghasilkan SELF DISCOVERY REPORT LENGKAP (versi premium PDF) dalam format JSON.

PRINSIP UTAMA (PRD JuruScope):
- Laporan ini adalah versi LENGKAP dari hasil teaser gratis. Harus jauh lebih dalam dan personal.
- Goal emosional: user merasa "wah ini relate banget sama gue", bukan "ini cuma quiz random".
- Bahasa Indonesia, hangat, relatable untuk Gen Z, tapi tetap berkualitas dan meyakinkan.
- Ini BUKAN psikotes formal. Hindari jargon HR. Fokus pada self discovery & arah masa depan.
- Hasil adalah panduan untuk mengenal diri, bukan keputusan mutlak. Sertakan disclaimer yang ramah.
- KONSISTEN dengan personality identity dan top jurusan dari hasil teaser di bawah. Jangan bertentangan.

HASIL TEASER YANG SUDAH DILIHAT USER (WAJIB konsisten):
- Personality Identity: ${personality.personalityTitle}
- Tagline: ${personality.tagline}
- Ringkasan: ${personality.summary}
- Arah awal: ${personality.basicFutureDirection}
Trait inti:
${traitLines || "- (tidak tersedia)"}
Top jurusan (teaser):
${jurusanLines || "- (tidak tersedia)"}

KONTEKS USER:
${interestNotes}

Gunakan rentang umur user sebagai konteks kedewasaan, tahap sekolah/kuliah/karir awal, dan tingkat konkret rekomendasi. Jangan membuat saran yang terlalu dewasa atau terlalu anak-anak untuk rentang umur tersebut.

STRUKTUR LAPORAN (8 SECTION sesuai PRD):
1. Personality Overview
2. Strength & Weakness
3. Top Jurusan Match (5 jurusan dengan persentase + alasan + contoh karir)
4. Career Direction
5. Future Lifestyle
6. Warning Area
7. Self Development Advice
8. Skill Roadmap

Return valid JSON dengan format PERSIS:
{
  "cover": {
    "title": "Self Discovery Report",
    "personality_title": "${personality.personalityTitle}",
    "tagline": "${escapeForJson(personality.tagline)}",
    "identity_label": "string: label singkat identitas, mis. 'Kreatif & Eksploratif'",
    "short_summary": "string: ringkasan 2 kalimat tentang siapa user"
  },
  "personality_overview": {
    "overview": "string: paragraf overview kepribadian yang personal",
    "core_identity": "string: inti identitas user dalam 2-3 kalimat",
    "dominant_traits": [
      { "trait": "string", "score": 0, "explanation": "string: kenapa trait ini menonjol" }
    ],
    "thinking_pattern": "string: penjelasan pola pikir dominan (kreatif/analitis/eksploratif)"
  },
  "strength_weakness": {
    "strengths": [ { "title": "string", "description": "string" } ],
    "weaknesses": [ { "title": "string", "description": "string" } ],
    "balancing_note": "string: cara menyeimbangkan kelebihan & kekurangan"
  },
  "top_jurusan_match": [
    { "jurusan": "string", "match_percentage": 0, "reason": "string: kenapa cocok", "career_example": "string: contoh profesi" }
  ],
  "career_direction": {
    "summary": "string: arah karir umum",
    "paths": [
      { "field": "string", "progression": "string: mis. 'UI/UX → Product Designer → Creative Director'", "explanation": "string" }
    ]
  },
  "future_lifestyle": {
    "work_style": "string: cara kerja ideal",
    "work_environment": "string: lingkungan kerja yang cocok",
    "work_pressure": "string: bagaimana user menghadapi tekanan",
    "lifestyle_compatibility": "string: gaya hidup yang cocok"
  },
  "warning_area": {
    "warnings": [
      { "area": "string", "explanation": "string", "suggestion": "string: cara menyiasati" }
    ]
  },
  "self_development_advice": {
    "advices": [
      { "focus": "string", "why": "string", "action": "string: langkah konkret" }
    ]
  },
  "skill_roadmap": {
    "phases": [
      { "phase": "string: mis. 'Sekarang - 6 bulan'", "focus": "string", "skills": ["string", "string"] }
    ]
  },
  "closing": {
    "strategic_recommendation": "string: rekomendasi utama untuk user",
    "final_note": "string: pesan penutup yang memotivasi",
    "disclaimer": "string: pengingat ramah bahwa hasil ini panduan self discovery, bukan keputusan mutlak"
  }
}

ATURAN OUTPUT:
- top_jurusan_match WAJIB 5 jurusan, urut dari paling cocok. 3 pertama sebaiknya selaras dengan teaser.
- dominant_traits minimal 3, gunakan trait dengan skor tertinggi dari teaser.
- strengths & weaknesses masing-masing minimal 3 item.
- career_direction.paths minimal 2.
- warning_area.warnings minimal 2 (PRD: "kurang cocok dengan pekerjaan repetitif & monoton", dll).
- self_development_advice.advices minimal 3.
- skill_roadmap.phases minimal 3 (bertahap).
- Ganti semua "string" dengan konten nyata Bahasa Indonesia.
- HANYA output JSON valid, tanpa markdown atau teks tambahan.`;
}

/** Build a human-readable context block from the wizard input. */
function buildInterestNotes(userInput: UserPlannerInput): string {
  const parts: string[] = [];
  if (userInput.locationCity) parts.push(`- Nama: ${userInput.locationCity}`);
  if (userInput.ageRange) parts.push(`- Rentang umur: ${userInput.ageRange}`);
  if (userInput.categoryInterest) parts.push(`- Bidang yang menarik: ${userInput.categoryInterest}`);
  if (userInput.assets.length > 0) parts.push(`- Hal yang dikuasai/disukai: ${userInput.assets.join(", ")}`);
  if (userInput.riskPreference) parts.push(`- Preferensi terhadap tantangan/risiko: ${userInput.riskPreference}`);
  if (userInput.availableTime) parts.push(`- Gaya energi/waktu: ${userInput.availableTime}`);
  if (userInput.sellingModel) parts.push(`- Preferensi cara berkarya: ${userInput.sellingModel}`);
  if (userInput.targetIncome) parts.push(`- Ekspektasi masa depan: ${userInput.targetIncome}`);
  return parts.length > 0 ? parts.join("\n") : "- (konteks terbatas, andalkan hasil teaser)";
}

function escapeForJson(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Legacy export kept so any remaining imports compile. Delegates to the
 * new report prompt when a personality result is available; otherwise
 * builds a minimal context-only prompt.
 */
export function buildPlanPrompt(args: {
  personality?: AiPersonalityResult;
  userInput: UserPlannerInput;
}): string {
  if (args.personality) {
    return buildReportPrompt({ personality: args.personality, userInput: args.userInput });
  }
  return buildReportPrompt({
    personality: {
      personalityId: "general",
      personalityTitle: "Self Discovery",
      tagline: "",
      summary: "",
      emotionalPreview: "",
      basicFutureDirection: "",
      coreTraits: [],
      topJurusan: [],
    },
    userInput: args.userInput,
  });
}
