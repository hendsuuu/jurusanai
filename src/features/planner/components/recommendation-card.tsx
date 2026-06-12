"use client";

import { Badge } from "@/components/ui/badge";
import type { JurusanTeaser } from "../types";
import { cn } from "@/lib/utils";

const TRAIT_LABELS: Record<string, string> = {
  creativity: "Kreativitas",
  logic: "Logika",
  leadership: "Kepemimpinan",
  communication: "Komunikasi",
  exploration: "Eksplorasi",
  stability: "Stabilitas",
  analytical_thinking: "Berpikir Analitis",
  social_intelligence: "Kecerdasan Sosial",
};

export function JurusanTeaserCard({
  jurusan,
  rank,
}: {
  jurusan: JurusanTeaser;
  rank: number;
}) {
  const highlight = rank === 0;
  return (
    <div
      className={cn(
        "rounded-[16px] border bg-white p-4 flex flex-col gap-2 transition-all",
        highlight
          ? "border-[#4B5320] ring-1 ring-[#4B5320] shadow-[0_8px_24px_rgba(75,83,32,0.1)]"
          : "border-[#DDD9BD] hover:border-[#CDD2A8] hover:shadow-[0_4px_16px_rgba(75,83,32,0.06)]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {highlight ? (
            <Badge variant="brand" className="text-[10px] px-2 py-0.5 mb-1">
              Paling cocok
            </Badge>
          ) : null}
          <h3 className="text-[15px] font-bold text-[#2A311A] leading-snug">
            {jurusan.name}
          </h3>
        </div>
        <span className="text-lg font-extrabold text-[#4B5320] shrink-0">
          {jurusan.matchPercentage}%
        </span>
      </div>
      {/* Match bar */}
      <div className="h-2 rounded-full bg-[#EDEBD4] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#4B5320]"
          style={{ width: `${Math.max(0, Math.min(100, jurusan.matchPercentage))}%` }}
        />
      </div>
      <p className="text-xs text-[#57604A] leading-relaxed">{jurusan.reason}</p>
    </div>
  );
}

export function TraitChip({ name, score }: { name: string; score: number }) {
  return (
    <div className="rounded-[10px] bg-[#F6F4E9] border border-[#DDD9BD] px-3 py-2">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-semibold text-[#2A311A]">
          {TRAIT_LABELS[name] ?? name}
        </span>
        <span className="text-[11px] font-bold text-[#4B5320]">{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#EDEBD4] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#C9A24E]"
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
}
