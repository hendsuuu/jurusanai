import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { AiSelfDiscoveryReport } from "@/server/ai/schemas";
import { LOGO_BASE64 } from "./logo-base64";

// ─── Types ───────────────────────────────────────────────────────────────

export type PdfData = {
  ai: AiSelfDiscoveryReport;
  packageType: "BASIC" | "PREMIUM" | "PRO";
  personalityTitle: string;
  locationCity: string;
  ageRange?: string;
  generatedAt: Date;
};

// ─── Helpers ─────────────────────────────────────────────────────────────

function fmtDate(d: Date): string {
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

// ─── Styles ──────────────────────────────────────────────────────────────

const colors = {
  navy: "#2A311A",
  green: "#4B5320",
  greenDark: "#3A4327",
  softGreen: "#EDEBD4",
  borderGreen: "#CDD2A8",
  gold: "#C9A24E",
  bg: "#FFFFFF",
  bgSoft: "#F6F4E9",
  text: "#57604A",
  textDark: "#2A311A",
  textMuted: "#8A8A72",
  border: "#DDD9BD",
  success: "#4B7A2F",
  successBg: "#E6EFD8",
  warn: "#B58E3C",
  warnBg: "#F6EDD3",
};

const s = StyleSheet.create({
  page: { padding: "14mm 14mm", fontFamily: "Helvetica", fontSize: 10.5, color: colors.text, lineHeight: 1.55 },
  // Cover
  coverPage: { padding: 0, backgroundColor: colors.green, color: "#fff", justifyContent: "center", alignItems: "center" },
  coverInner: { padding: "30mm 20mm", width: "100%", height: "100%" },
  coverBrand: { flexDirection: "row", alignItems: "center", gap: 8 },
  coverBrandName: { fontSize: 14, fontWeight: "bold", letterSpacing: 0.5, color: "#FFFFFF" },
  coverPill: { marginTop: 24, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start" },
  coverPillText: { fontSize: 8, fontWeight: "bold", letterSpacing: 1.5, textTransform: "uppercase", color: "#fff" },
  coverTitle: { marginTop: 14, fontSize: 30, fontWeight: "bold", lineHeight: 1.1, color: "#fff" },
  coverIdentity: { marginTop: 10, fontSize: 20, fontWeight: "bold", color: colors.gold },
  coverTagline: { marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.82)", lineHeight: 1.5 },
  coverMeta: { marginTop: 22, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  coverMetaBox: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "8 10", width: "47%" },
  coverMetaLabel: { fontSize: 7, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1 },
  coverMetaValue: { fontSize: 11, fontWeight: "bold", color: "#fff", marginTop: 3 },
  coverFooter: { marginTop: "auto", flexDirection: "row", justifyContent: "space-between" },
  coverFooterText: { fontSize: 8, color: "rgba(255,255,255,0.65)" },
  // Section
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8 },
  sectionNum: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.green, justifyContent: "center", alignItems: "center" },
  sectionNumText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: colors.navy },
  sectionSub: { fontSize: 9.5, color: colors.textMuted, marginTop: 2 },
  // Content
  h3: { fontSize: 11.5, fontWeight: "bold", color: colors.navy, marginTop: 10, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.3 },
  p: { fontSize: 10.5, color: colors.text, marginBottom: 5, lineHeight: 1.6 },
  li: { fontSize: 10.5, color: colors.text, marginBottom: 3, paddingLeft: 8 },
  // Table
  table: { marginVertical: 6 },
  tableHeader: { flexDirection: "row", backgroundColor: colors.softGreen, borderBottomWidth: 1.5, borderBottomColor: colors.borderGreen },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: colors.border },
  th: { fontSize: 9, fontWeight: "bold", color: colors.navy, padding: "6 8", textTransform: "uppercase", letterSpacing: 0.3 },
  td: { fontSize: 10, color: colors.text, padding: "6 8" },
  tdNum: { fontSize: 10, color: colors.textDark, padding: "6 8", fontWeight: "bold" },
  // Trait bar
  traitRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  traitLabel: { width: "32%", fontSize: 9.5, color: colors.textDark },
  traitBarBg: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.softGreen },
  traitBarFill: { height: 8, borderRadius: 4, backgroundColor: colors.green },
  traitScore: { width: 32, fontSize: 9, fontWeight: "bold", color: colors.green, textAlign: "right" },
  // Metric / match
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 8 },
  metricCard: { width: "31%", borderWidth: 1, borderColor: colors.borderGreen, borderRadius: 10, padding: "10 12", borderLeftWidth: 3, borderLeftColor: colors.green },
  metricLabel: { fontSize: 8.5, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  metricValue: { fontSize: 16, fontWeight: "bold", color: colors.navy, marginTop: 3 },
  metricNote: { fontSize: 8.5, color: colors.textMuted, marginTop: 3 },
  // Callout
  callout: { borderRadius: 10, padding: "12 14", marginVertical: 8 },
  calloutInfo: { backgroundColor: colors.softGreen, borderWidth: 1, borderColor: colors.borderGreen },
  calloutWarn: { backgroundColor: colors.warnBg, borderWidth: 1, borderColor: "#E7D49B" },
  calloutSuccess: { backgroundColor: colors.successBg, borderWidth: 1, borderColor: "#BBD79A" },
  calloutTitle: { fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 },
  // Footer
  footer: { position: "absolute", bottom: 10, left: 14, right: 14, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.5, borderTopColor: colors.border, paddingTop: 4 },
  footerText: { fontSize: 7, color: colors.textMuted },
});

// ─── Shared components ─────────────────────────────────────────────────────

function SectionHead({ num, title, sub }: { num: string; title: string; sub?: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionNum}><Text style={s.sectionNumText}>{num}</Text></View>
      <View>
        <Text style={s.sectionTitle}>{title}</Text>
        {sub ? <Text style={s.sectionSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

function TableRow({ cells, header }: { cells: Array<{ text: string; width: string; num?: boolean }>; header?: boolean }) {
  return (
    <View style={header ? s.tableHeader : s.tableRow}>
      {cells.map((c, i) => (
        <Text key={i} style={[header ? s.th : (c.num ? s.tdNum : s.td), { width: c.width }]}>{c.text}</Text>
      ))}
    </View>
  );
}

function TraitBar({ name, score }: { name: string; score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <View style={s.traitRow}>
      <Text style={s.traitLabel}>{labelTrait(name)}</Text>
      <View style={s.traitBarBg}>
        <View style={[s.traitBarFill, { width: `${pct}%` }]} />
      </View>
      <Text style={s.traitScore}>{pct}</Text>
    </View>
  );
}

function labelTrait(name: string): string {
  const map: Record<string, string> = {
    creativity: "Kreativitas",
    logic: "Logika",
    leadership: "Kepemimpinan",
    communication: "Komunikasi",
    exploration: "Eksplorasi",
    stability: "Stabilitas",
    analytical_thinking: "Berpikir Analitis",
    social_intelligence: "Kecerdasan Sosial",
  };
  return map[name] ?? name;
}

function PageFooter({ pageLabel }: { pageLabel: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>Generated by JuruScope · Kenali dirimu sebelum menentukan masa depan · {new Date().getFullYear()}</Text>
      <Text style={s.footerText}>{pageLabel}</Text>
    </View>
  );
}

// ─── Cover ──────────────────────────────────────────────────────────────

function CoverPage({ data }: { data: PdfData }) {
  const { ai, generatedAt, packageType, locationCity, ageRange } = data;
  return (
    <Page size="A4" style={[s.page, s.coverPage]}>
      <View style={s.coverInner}>
        <View style={s.coverBrand}>
          <Image src={LOGO_BASE64} style={{ width: 32, height: 32, borderRadius: 8 }} />
          <View>
            <Text style={s.coverBrandName}>Juru<Text style={{ color: colors.gold }}>Scope</Text></Text>
            <Text style={{ fontSize: 7, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>Self Discovery Report</Text>
          </View>
        </View>
        <View style={s.coverPill}>
          <Text style={s.coverPillText}>Self Discovery Report · {packageType}</Text>
        </View>
        <Text style={s.coverTitle}>{ai.cover.title}</Text>
        <Text style={s.coverIdentity}>{ai.cover.personality_title}</Text>
        <Text style={s.coverTagline}>{ai.cover.tagline}</Text>
        <View style={s.coverMeta}>
          <View style={s.coverMetaBox}><Text style={s.coverMetaLabel}>Personality</Text><Text style={s.coverMetaValue}>{ai.cover.personality_title}</Text></View>
          <View style={s.coverMetaBox}><Text style={s.coverMetaLabel}>Identitas</Text><Text style={s.coverMetaValue}>{ai.cover.identity_label}</Text></View>
          <View style={s.coverMetaBox}><Text style={s.coverMetaLabel}>Nama</Text><Text style={s.coverMetaValue}>{locationCity || "-"}</Text></View>
          <View style={s.coverMetaBox}><Text style={s.coverMetaLabel}>Rentang Umur</Text><Text style={s.coverMetaValue}>{ageRange || "-"}</Text></View>
          <View style={s.coverMetaBox}><Text style={s.coverMetaLabel}>Paket</Text><Text style={s.coverMetaValue}>{packageType}</Text></View>
        </View>
        <View style={[s.coverFooter, { marginTop: 30 }]}>
          <Text style={s.coverFooterText}>Disusun: {fmtDate(generatedAt)}</Text>
          <Text style={s.coverFooterText}>Confidential</Text>
        </View>
      </View>
    </Page>
  );
}

// ─── Section 1: Personality Overview ───────────────────────────────────────

function PersonalityOverviewPage({ data }: { data: PdfData }) {
  const o = data.ai.personality_overview;
  return (
    <Page size="A4" style={s.page}>
      <SectionHead num="01" title="Personality Overview" sub="Gambaran kepribadian & pola pikir" />
      <Text style={s.p}>{o.overview}</Text>
      <Text style={s.h3}>Inti Identitas</Text>
      <Text style={s.p}>{o.core_identity}</Text>
      <Text style={s.h3}>Trait Dominan</Text>
      {o.dominant_traits.map((t, i) => (
        <View key={i} style={{ marginBottom: 6 }}>
          <TraitBar name={t.trait} score={t.score} />
          <Text style={[s.li, { fontSize: 9.5 }]}>{t.explanation}</Text>
        </View>
      ))}
      <Text style={s.h3}>Pola Pikir</Text>
      <Text style={s.p}>{o.thinking_pattern}</Text>
      <PageFooter pageLabel="Personality Overview" />
    </Page>
  );
}

// ─── Section 2: Strength & Weakness ─────────────────────────────────────────

function StrengthWeaknessPage({ data }: { data: PdfData }) {
  const sw = data.ai.strength_weakness;
  return (
    <Page size="A4" style={s.page}>
      <SectionHead num="02" title="Strength & Weakness" sub="Kelebihan, kekurangan, dan cara menyeimbangkan" />
      <Text style={s.h3}>Kelebihan</Text>
      {sw.strengths.map((x, i) => (
        <View key={i} style={[s.callout, s.calloutSuccess, { marginVertical: 3 }]}>
          <Text style={[s.calloutTitle, { color: colors.success }]}>{x.title}</Text>
          <Text style={[s.p, { fontSize: 9.5, marginBottom: 0 }]}>{x.description}</Text>
        </View>
      ))}
      <Text style={s.h3}>Area yang Perlu Dikembangkan</Text>
      {sw.weaknesses.map((x, i) => (
        <View key={i} style={[s.callout, s.calloutWarn, { marginVertical: 3 }]}>
          <Text style={[s.calloutTitle, { color: colors.warn }]}>{x.title}</Text>
          <Text style={[s.p, { fontSize: 9.5, marginBottom: 0 }]}>{x.description}</Text>
        </View>
      ))}
      <Text style={s.h3}>Cara Menyeimbangkan</Text>
      <Text style={s.p}>{sw.balancing_note}</Text>
      <PageFooter pageLabel="Strength & Weakness" />
    </Page>
  );
}

// ─── Section 3: Top Jurusan Match ───────────────────────────────────────────

function JurusanMatchPage({ data }: { data: PdfData }) {
  const list = data.ai.top_jurusan_match;
  return (
    <Page size="A4" style={s.page}>
      <SectionHead num="03" title="Top Jurusan Match" sub="Jurusan yang paling cocok denganmu" />
      {list.map((j, i) => (
        <View key={i} style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
            <Text style={[s.h3, { marginTop: 0, marginBottom: 0, flex: 1 }]}>{i + 1}. {j.jurusan}</Text>
            <Text style={{ fontSize: 13, fontWeight: "bold", color: colors.green }}>{j.match_percentage}%</Text>
          </View>
          <View style={s.traitBarBg}>
            <View style={[s.traitBarFill, { width: `${Math.max(0, Math.min(100, j.match_percentage))}%` }]} />
          </View>
          <Text style={[s.p, { fontSize: 9.5, marginTop: 4 }]}>{j.reason}</Text>
          <Text style={[s.li, { fontSize: 9, color: colors.textMuted }]}>Contoh karir: {j.career_example}</Text>
        </View>
      ))}
      <PageFooter pageLabel="Top Jurusan" />
    </Page>
  );
}

// ─── Section 4: Career Direction ────────────────────────────────────────────

function CareerDirectionPage({ data }: { data: PdfData }) {
  const c = data.ai.career_direction;
  return (
    <Page size="A4" style={s.page}>
      <SectionHead num="04" title="Career Direction" sub="Arah karir & jalur pengembangan" />
      <Text style={s.p}>{c.summary}</Text>
      {c.paths.map((p, i) => (
        <View key={i} style={[s.callout, s.calloutInfo, { marginVertical: 4 }]}>
          <Text style={[s.calloutTitle, { color: colors.green }]}>{p.field}</Text>
          <Text style={[s.p, { fontSize: 10, fontWeight: "bold", color: colors.navy, marginBottom: 3 }]}>{p.progression}</Text>
          <Text style={[s.p, { fontSize: 9.5, marginBottom: 0 }]}>{p.explanation}</Text>
        </View>
      ))}
      <PageFooter pageLabel="Career Direction" />
    </Page>
  );
}

// ─── Section 5: Future Lifestyle ────────────────────────────────────────────

function LifestylePage({ data }: { data: PdfData }) {
  const l = data.ai.future_lifestyle;
  return (
    <Page size="A4" style={s.page}>
      <SectionHead num="05" title="Future Lifestyle" sub="Gaya kerja & lingkungan yang cocok" />
      <Text style={s.h3}>Gaya Kerja</Text>
      <Text style={s.p}>{l.work_style}</Text>
      <Text style={s.h3}>Lingkungan Kerja</Text>
      <Text style={s.p}>{l.work_environment}</Text>
      <Text style={s.h3}>Menghadapi Tekanan</Text>
      <Text style={s.p}>{l.work_pressure}</Text>
      <Text style={s.h3}>Lifestyle Compatibility</Text>
      <Text style={s.p}>{l.lifestyle_compatibility}</Text>
      <PageFooter pageLabel="Future Lifestyle" />
    </Page>
  );
}

// ─── Section 6: Warning Area ────────────────────────────────────────────────

function WarningPage({ data }: { data: PdfData }) {
  const warnings = data.ai.warning_area.warnings;
  return (
    <Page size="A4" style={s.page}>
      <SectionHead num="06" title="Warning Area" sub="Hal yang perlu kamu waspadai" />
      {warnings.map((w, i) => (
        <View key={i} style={[s.callout, s.calloutWarn, { marginVertical: 4 }]}>
          <Text style={[s.calloutTitle, { color: colors.warn }]}>{w.area}</Text>
          <Text style={[s.p, { fontSize: 9.5 }]}>{w.explanation}</Text>
          <Text style={[s.p, { fontSize: 9.5, color: colors.green, marginBottom: 0 }]}>
            <Text style={{ fontWeight: 700 }}>Saran: </Text>{w.suggestion}
          </Text>
        </View>
      ))}
      <PageFooter pageLabel="Warning Area" />
    </Page>
  );
}

// ─── Section 7: Self Development Advice ─────────────────────────────────────

function DevelopmentPage({ data }: { data: PdfData }) {
  const advices = data.ai.self_development_advice.advices;
  return (
    <Page size="A4" style={s.page}>
      <SectionHead num="07" title="Self Development Advice" sub="Saran pengembangan diri" />
      {advices.map((a, i) => (
        <View key={i} style={{ marginBottom: 8 }}>
          <Text style={s.h3}>{i + 1}. {a.focus}</Text>
          <Text style={[s.p, { fontSize: 9.5 }]}><Text style={{ fontWeight: 700 }}>Kenapa: </Text>{a.why}</Text>
          <Text style={[s.p, { fontSize: 9.5, color: colors.green }]}><Text style={{ fontWeight: 700 }}>Aksi: </Text>{a.action}</Text>
        </View>
      ))}
      <PageFooter pageLabel="Self Development" />
    </Page>
  );
}

// ─── Section 8: Skill Roadmap ───────────────────────────────────────────────

function SkillRoadmapPage({ data }: { data: PdfData }) {
  const phases = data.ai.skill_roadmap.phases;
  const closing = data.ai.closing;
  return (
    <Page size="A4" style={s.page}>
      <SectionHead num="08" title="Skill Roadmap" sub="Rencana pengembangan skill bertahap" />
      {phases.map((p, i) => (
        <View key={i} style={[s.callout, s.calloutInfo, { marginVertical: 4 }]}>
          <Text style={[s.calloutTitle, { color: colors.green }]}>{p.phase} — {p.focus}</Text>
          {p.skills.map((sk, j) => (
            <Text key={j} style={[s.li, { fontSize: 9.5 }]}>• {sk}</Text>
          ))}
        </View>
      ))}

      <Text style={s.h3}>Rekomendasi Strategis</Text>
      <Text style={s.p}>{closing.strategic_recommendation}</Text>

      <View style={[s.callout, s.calloutSuccess]}>
        <Text style={[s.calloutTitle, { color: colors.success }]}>Pesan Penutup</Text>
        <Text style={[s.p, { color: colors.success, marginBottom: 0 }]}>{closing.final_note}</Text>
      </View>
      <View style={[s.callout, s.calloutWarn]}>
        <Text style={[s.calloutTitle, { color: colors.warn }]}>Disclaimer</Text>
        <Text style={[s.p, { color: colors.warn, fontSize: 8.5, marginBottom: 0 }]}>{closing.disclaimer}</Text>
      </View>
      <PageFooter pageLabel="Skill Roadmap" />
    </Page>
  );
}

// ─── Document Exports ────────────────────────────────────────────────────

export function PremiumPdfDocument({ data }: { data: PdfData }) {
  return (
    <Document title={data.ai.cover.title} author="JuruScope" subject="Self Discovery Report">
      <CoverPage data={data} />
      <PersonalityOverviewPage data={data} />
      <StrengthWeaknessPage data={data} />
      <JurusanMatchPage data={data} />
      <CareerDirectionPage data={data} />
      <LifestylePage data={data} />
      <WarningPage data={data} />
      <DevelopmentPage data={data} />
      <SkillRoadmapPage data={data} />
    </Document>
  );
}

/**
 * Basic report — a lighter version (personality overview, top jurusan,
 * career direction, closing). Upsell note points to the premium report.
 */
export function BasicPdfDocument({ data }: { data: PdfData }) {
  const { ai } = data;
  return (
    <Document title={`${ai.cover.title} (Basic)`} author="JuruScope" subject="Self Discovery Report Basic">
      <CoverPage data={data} />
      <PersonalityOverviewPage data={data} />
      <JurusanMatchPage data={data} />
      <Page size="A4" style={s.page}>
        <SectionHead num="04" title="Career Direction" sub="Arah karir & langkah berikutnya" />
        <Text style={s.p}>{ai.career_direction.summary}</Text>
        {ai.career_direction.paths.map((p, i) => (
          <View key={i} style={[s.callout, s.calloutInfo, { marginVertical: 4 }]}>
            <Text style={[s.calloutTitle, { color: colors.green }]}>{p.field}</Text>
            <Text style={[s.p, { fontSize: 10, fontWeight: "bold", color: colors.navy, marginBottom: 3 }]}>{p.progression}</Text>
            <Text style={[s.p, { fontSize: 9.5, marginBottom: 0 }]}>{p.explanation}</Text>
          </View>
        ))}
        <View style={[s.callout, s.calloutInfo, { marginTop: 8 }]}>
          <Text style={[s.calloutTitle, { color: colors.green }]}>Upgrade ke Expert Deep Report</Text>
          <Text style={[s.p, { color: colors.green, fontSize: 8.5, marginBottom: 0 }]}>
            Dapatkan strength & weakness mendalam, future lifestyle, warning area, self development advice, dan skill roadmap lengkap.
          </Text>
        </View>
        <View style={[s.callout, s.calloutWarn, { marginTop: 8 }]}>
          <Text style={[s.calloutTitle, { color: colors.warn }]}>Disclaimer</Text>
          <Text style={[s.p, { color: colors.warn, fontSize: 8.5, marginBottom: 0 }]}>{ai.closing.disclaimer}</Text>
        </View>
        <PageFooter pageLabel="Career Direction" />
      </Page>
    </Document>
  );
}
