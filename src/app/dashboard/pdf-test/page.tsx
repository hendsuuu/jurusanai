"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { Download, FlaskConical, FileText } from "lucide-react";

export default function PdfTestPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleGenerate(packageType: "PREMIUM") {
    setLoading(packageType);
    try {
      const res = await fetch("/api/admin/pdf-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageType }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `test-${packageType.toLowerCase()}-self-discovery.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`PDF ${packageType} berhasil di-generate!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal generate PDF";
      toast.error(msg);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="PDF Template Test"
        description="Generate dan download test PDF self discovery report menggunakan data mockup."
      />

      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-brand-600" />
          <h2 className="font-semibold text-slate-900">
            Test PDF Generator
          </h2>
        </div>

        <p className="text-sm text-slate-600">
          PDF dibuat dari data mockup &ldquo;Creative Strategist&rdquo; untuk
          mengecek layout dan konten template sebelum production.
        </p>

        <div className="grid gap-4">
          <Card className="p-5 space-y-3 border-brand-200">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <h3 className="font-semibold">Expert Deep Report</h3>
              <Badge variant="brand">~9 halaman</Badge>
            </div>
            <p className="text-sm text-slate-600">
              Full self discovery: strength &amp; weakness, warning area, lifestyle, skill roadmap.
            </p>
            <Button
              onClick={() => handleGenerate("PREMIUM")}
              loading={loading === "PREMIUM"}
              disabled={loading !== null}
              className="w-full"
            >
              <Download className="w-4 h-4" />
              Generate Expert PDF
            </Button>
          </Card>
        </div>

        <p className="text-xs text-slate-500">
          PDF di-generate menggunakan data mockup. Gunakan ini untuk testing
          layout dan konten sebelum production.
        </p>
      </Card>
    </div>
  );
}
