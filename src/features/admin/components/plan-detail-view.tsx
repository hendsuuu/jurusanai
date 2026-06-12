"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { CurrencyText } from "@/components/shared/currency-text";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { formatDate } from "@/lib/format";
import { AdminGeneratePdfButton } from "./admin-generate-pdf-button";
import { useAdminPlanDetail } from "../hooks/use-admin-queries";

export function PlanDetailView({ planId }: { planId: string }) {
  const query = useAdminPlanDetail(planId);

  if (query.isLoading) {
    return <LoadingState message="Memuat detail hasil…" />;
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        title="Tidak bisa memuat hasil"
        onRetry={() => query.refetch()}
      />
    );
  }

  const { plan } = query.data;
  const result = (plan.personalityJson as { result?: PersonalityResultLike } | null)?.result ?? null;
  const ai = plan.reportJson as ReportLike | null;
  const overview = ai?.personality_overview?.overview;
  const recommendation = ai?.closing?.strategic_recommendation;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/plans"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Hasil Analisis
      </Link>

      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Hasil Analisis</p>
          <h1 className="text-2xl font-bold text-slate-900">
            {plan.personalityTitle ?? "(belum dipilih)"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {plan.studentName ?? "Siswa"} · {plan.futureLifestyle} · {formatDate(plan.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">{plan.interestArea}</Badge>
          <StatusBadge status={plan.status} />
          <AdminGeneratePdfButton
            planId={plan.id}
            currentStatus={plan.status}
            hasPaidOrder={plan.orders.some((o) => o.status === "SUCCESS")}
          />
        </div>
      </header>

      {result ? (
        <Card className="p-5">
          <h2 className="font-semibold mb-3 text-[#2A311A]">Personality & Top Jurusan</h2>
          <p className="text-sm text-slate-700 mb-1">
            <span className="font-semibold">{result.personalityTitle}</span>
            {result.tagline ? ` — ${result.tagline}` : ""}
          </p>
          {result.summary ? (
            <p className="text-sm text-slate-600 leading-relaxed mb-3">{result.summary}</p>
          ) : null}
          {result.topJurusan && result.topJurusan.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.topJurusan.map((j) => (
                <Badge key={j.name} variant="blue">
                  {j.name} · {j.matchPercentage}%
                </Badge>
              ))}
            </div>
          ) : null}
        </Card>
      ) : null}

      {ai ? (
        <Card className="p-5 space-y-3">
          <h2 className="font-semibold text-[#2A311A]">Narasi Report</h2>
          {overview ? (
            <p className="text-sm text-slate-700 leading-relaxed">{overview}</p>
          ) : null}
          {recommendation ? (
            <p className="text-sm text-slate-700 leading-relaxed">{recommendation}</p>
          ) : null}
        </Card>
      ) : null}

      <Card className="p-5">
        <h2 className="font-semibold mb-3 text-[#2A311A]">Orders</h2>
        {plan.orders.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada order.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {plan.orders.map((o) => (
              <li
                key={o.id}
                className="py-3 flex items-center justify-between text-sm gap-3 flex-wrap"
              >
                <Link
                  href={`/dashboard/orders/${o.id}`}
                  className="font-mono text-xs text-[#4B5320] hover:underline"
                >
                  {o.orderCode}
                </Link>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline">{o.packageType}</Badge>
                  <CurrencyText value={o.amount} className="font-semibold" />
                  <StatusBadge status={o.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

type PersonalityResultLike = {
  personalityTitle: string;
  tagline?: string;
  summary?: string;
  topJurusan?: Array<{ name: string; matchPercentage: number }>;
};

type ReportLike = {
  personality_overview?: { overview?: string };
  closing?: { strategic_recommendation?: string };
};
