"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, DollarSign, Cpu, ScrollText, Trash2, Database, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { apiClient } from "@/lib/api-client";

type SettingsData = {
  pricePremium: number;
  promoPercentage: number;
  aiRecommendationProvider: string;
  aiRecommendationModel: string;
  aiPlanProvider: string;
  aiPlanModel: string;
  auditLogEnabled: boolean;
};

const AI_PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "gemini", label: "Google Gemini" },
  { value: "mock", label: "Mock (Testing)" },
];

const DEFAULT_SETTINGS: SettingsData = {
  pricePremium: 99000,
  promoPercentage: 0,
  aiRecommendationProvider: "openai",
  aiRecommendationModel: "gpt-5.4-mini",
  aiPlanProvider: "openai",
  aiPlanModel: "gpt-5.4-mini",
  auditLogEnabled: true,
};

export function AdminSettingsView() {
  const qc = useQueryClient();
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const query = useQuery<SettingsData>({
    queryKey: ["admin", "settings"],
    queryFn: () => apiClient<SettingsData>("/api/admin/settings"),
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<SettingsData>) =>
      apiClient<SettingsData>("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(data),
    }),
    onSuccess: (data) => {
      qc.setQueryData(["admin", "settings"], data);
      setDraft(data);
      toast.success("Settings berhasil disimpan.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan settings.");
    },
  });

  const clearLogsMutation = useMutation({
    mutationFn: () =>
      apiClient<{ deleted: number }>("/api/admin/logs/clear", { method: "DELETE" }),
    onSuccess: (data) => {
      toast.success(`${data.deleted} audit log berhasil dihapus.`);
      setClearConfirmOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "logs"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus audit logs.");
    },
  });

  const [draft, setDraft] = useState<SettingsData | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const form = draft ?? query.data ?? DEFAULT_SETTINGS;

  function handleSave() {
    mutation.mutate(form);
  }

  async function handleBackup() {
    setBackupLoading(true);
    try {
      const res = await fetch("/api/admin/backup");
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Gagal download backup" }));
        throw new Error(err.message);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="(.+)"/);
      a.download = match?.[1] ?? `juruscope-backup-${Date.now()}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Backup berhasil didownload.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat backup.");
    } finally {
      setBackupLoading(false);
    }
  }

  function updateForm(updater: (current: SettingsData) => SettingsData) {
    setDraft((current) => updater(current ?? form));
  }

  if (query.isLoading) return <LoadingState message="Memuat settings…" />;
  if (query.isError) return <ErrorState onRetry={() => query.refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Atur harga Expert Deep Report, promo, dan konfigurasi AI model."
      />

      {/* Pricing Section */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-brand-600" />
          <h2 className="font-semibold text-slate-900">Pricing</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="pricePremium">Harga Expert Deep Report (Rp)</Label>
            <Input
              id="pricePremium"
              type="number"
              min={0}
              value={form.pricePremium}
              onChange={(e) =>
                updateForm((f) => ({ ...f, pricePremium: Number(e.target.value) }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="promoPercentage">Promo Diskon (%)</Label>
            <Input
              id="promoPercentage"
              type="number"
              min={0}
              max={100}
              value={form.promoPercentage}
              onChange={(e) =>
                updateForm((f) => ({
                  ...f,
                  promoPercentage: Number(e.target.value),
                }))
              }
            />
            <p className="text-[11px] text-slate-500">
              0 = tidak ada promo. Contoh: 10 = diskon 10%.
            </p>
          </div>
        </div>
      </Card>

      {/* AI Config Section */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-brand-600" />
          <h2 className="font-semibold text-slate-900">AI Model Configuration</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Recommendations */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-900">
              Recommendations
            </h3>
            <p className="text-xs text-slate-500">
              Provider dan model untuk generate 4 rekomendasi ide bisnis.
            </p>
            <div className="space-y-2">
              <Label htmlFor="aiRecProvider">Provider</Label>
              <Select
                id="aiRecProvider"
                value={form.aiRecommendationProvider}
                onChange={(e) =>
                  updateForm((f) => ({
                    ...f,
                    aiRecommendationProvider: e.target.value,
                  }))
                }
              >
                {AI_PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aiRecModel">Model</Label>
              <Input
                id="aiRecModel"
                value={form.aiRecommendationModel}
                onChange={(e) =>
                  updateForm((f) => ({
                    ...f,
                    aiRecommendationModel: e.target.value,
                  }))
                }
                placeholder="e.g. gpt-5.4-mini, gpt-4.1-mini"
              />
            </div>
          </div>

          {/* Business Plan */}
          <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-900">
              Business Plan Generation
            </h3>
            <p className="text-xs text-slate-500">
              Provider dan model untuk generate business plan lengkap.
            </p>
            <div className="space-y-2">
              <Label htmlFor="aiPlanProvider">Provider</Label>
              <Select
                id="aiPlanProvider"
                value={form.aiPlanProvider}
                onChange={(e) =>
                  updateForm((f) => ({ ...f, aiPlanProvider: e.target.value }))
                }
              >
                {AI_PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aiPlanModel">Model</Label>
              <Input
                id="aiPlanModel"
                value={form.aiPlanModel}
                onChange={(e) =>
                  updateForm((f) => ({ ...f, aiPlanModel: e.target.value }))
                }
                placeholder="e.g. gpt-5.4-mini, gpt-4.1"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Audit Log Section */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-brand-600" />
          <h2 className="font-semibold text-slate-900">Audit Log</h2>
        </div>

        <div className="space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Audit Log Aktif
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Jika dinonaktifkan, sistem tidak akan mencatat aktivitas baru. Data lama tetap tersimpan.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.auditLogEnabled}
              onClick={() =>
                updateForm((f) => ({ ...f, auditLogEnabled: !f.auditLogEnabled }))
              }
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B5320] focus-visible:ring-offset-2 ${
                form.auditLogEnabled ? "bg-[#4B5320]" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  form.auditLogEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Clear All */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50/50">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Hapus Semua Audit Log
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Menghapus seluruh riwayat audit log dari database. Tidak bisa di-undo.
                Berguna untuk menghemat storage Neon.
              </p>
            </div>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setClearConfirmOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </Button>
          </div>
        </div>
      </Card>

      {/* Database Backup Section */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-brand-600" />
          <h2 className="font-semibold text-slate-900">Database Backup</h2>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Download Backup SQL
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Export seluruh data database sebagai file .sql (INSERT statements).
              Berguna untuk backup manual karena Neon free tier tidak punya automated backup.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleBackup}
            loading={backupLoading}
          >
            <Download className="w-3.5 h-3.5" />
            Download .sql
          </Button>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={mutation.isPending}>
          <Save className="w-4 h-4" />
          Simpan Settings
        </Button>
      </div>

      {/* Clear Logs Confirmation */}
      <ConfirmDialog
        open={clearConfirmOpen}
        onClose={() => {
          if (!clearLogsMutation.isPending) setClearConfirmOpen(false);
        }}
        onConfirm={() => clearLogsMutation.mutate()}
        title="Hapus semua audit log?"
        description="Seluruh riwayat aktivitas akan dihapus permanen dari database. Aksi ini tidak bisa dibatalkan."
        confirmLabel={clearLogsMutation.isPending ? "Menghapus…" : "Ya, hapus semua"}
        cancelLabel="Batal"
        variant="danger"
        loading={clearLogsMutation.isPending}
        icon={<Trash2 className="w-5 h-5 text-[#DC2626]" />}
      />
    </div>
  );
}
