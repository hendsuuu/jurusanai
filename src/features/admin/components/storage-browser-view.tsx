"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Trash2,
  RefreshCw,
  FileText,
  HardDrive,
  Calendar,
  Search,
  CheckSquare,
  Square,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { formatDate } from "@/lib/format";

type StorageFile = {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  type: string;
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

async function fetchStorageFiles(from?: string, to?: string): Promise<{ files: StorageFile[]; total: number }> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const res = await fetch(`/api/admin/storage?${params.toString()}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Gagal memuat file");
  return json.data;
}

async function deleteStorageFiles(keys: string[]): Promise<{ deleted: number; errors: number }> {
  const res = await fetch("/api/admin/storage", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keys }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Gagal menghapus file");
  return json.data;
}

export function StorageBrowserView() {
  const qc = useQueryClient();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);

  const query = useQuery({
    queryKey: ["admin", "storage", appliedFrom, appliedTo],
    queryFn: () => fetchStorageFiles(appliedFrom || undefined, appliedTo || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStorageFiles,
    onSuccess: (data) => {
      toast.success(`${data.deleted} file berhasil dihapus`);
      setSelected(new Set());
      setConfirmDelete(false);
      qc.invalidateQueries({ queryKey: ["admin", "storage"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setConfirmDelete(false);
    },
  });

  function applyFilter() {
    setAppliedFrom(dateFrom);
    setAppliedTo(dateTo);
    setSelected(new Set());
  }

  function clearFilter() {
    setDateFrom("");
    setDateTo("");
    setAppliedFrom("");
    setAppliedTo("");
    setSelected(new Set());
  }

  function toggleSelect(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleSelectAll() {
    if (!query.data) return;
    if (selected.size === query.data.files.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(query.data.files.map((f) => f.key)));
    }
  }

  function handleDelete() {
    if (selected.size === 0) return;
    deleteMutation.mutate(Array.from(selected));
  }

  const files = query.data?.files ?? [];
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#2A311A]">Storage Browser</h1>
          <p className="text-sm text-[#57604A] mt-1">
            Kelola file PDF di R2 storage. Filter berdasarkan tanggal untuk cleanup file lama.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="blue" className="gap-1.5">
            <HardDrive className="w-3 h-3" />
            {query.data ? `${query.data.total} file` : "..."}
          </Badge>
          {totalSize > 0 ? (
            <Badge variant="neutral">{formatBytes(totalSize)}</Badge>
          ) : null}
        </div>
      </div>

      {/* Filter */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date-from" className="text-xs flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                Dari tanggal
              </Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date-to" className="text-xs flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                Sampai tanggal
              </Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="primary" size="sm" onClick={applyFilter}>
              <Search className="w-3.5 h-3.5" />
              Filter
            </Button>
            {(appliedFrom || appliedTo) ? (
              <Button variant="ghost" size="sm" onClick={clearFilter}>
                Reset
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => qc.invalidateQueries({ queryKey: ["admin", "storage"] })}
              disabled={query.isFetching}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${query.isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Bulk actions */}
      {selected.size > 0 ? (
        <Card className="p-4 border-[#DC2626]/30 bg-[#FEF2F2]">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm font-medium text-[#DC2626]">
              {selected.size} file dipilih
            </p>
            <div className="flex items-center gap-2">
              {!confirmDelete ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus {selected.size} file
                </Button>
              ) : (
                <>
                  <p className="text-xs text-[#DC2626] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Yakin hapus? Tidak bisa di-undo.
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                    loading={deleteMutation.isPending}
                  >
                    Ya, hapus
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Batal
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      ) : null}

      {/* File list */}
      {query.isLoading ? (
        <LoadingState message="Memuat daftar file dari R2…" />
      ) : query.isError ? (
        <ErrorState
          title="Gagal memuat storage"
          description="Pastikan S3/R2 credentials sudah dikonfigurasi."
          onRetry={() => query.refetch()}
        />
      ) : files.length === 0 ? (
        <Card className="p-8 text-center">
          <HardDrive className="w-10 h-10 text-[#8A8A72] mx-auto mb-3" />
          <p className="text-sm text-[#57604A]">
            {appliedFrom || appliedTo
              ? "Tidak ada file dalam rentang tanggal ini."
              : "Storage kosong."}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_100px_100px_140px] gap-3 px-4 py-3 border-b border-[#DDD9BD] bg-[#F6F4E9] text-xs font-semibold text-[#57604A] uppercase tracking-wider">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="w-5 h-5 flex items-center justify-center"
              aria-label="Select all"
            >
              {selected.size === files.length ? (
                <CheckSquare className="w-4 h-4 text-[#4B5320]" />
              ) : (
                <Square className="w-4 h-4 text-[#8A8A72]" />
              )}
            </button>
            <span>Nama File</span>
            <span>Type</span>
            <span className="text-right">Size</span>
            <span className="text-right">Modified</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#DDD9BD] max-h-[600px] overflow-y-auto">
            {files.map((file) => {
              const isSelected = selected.has(file.key);
              return (
                <div
                  key={file.key}
                  className={`grid grid-cols-[auto_1fr_100px_100px_140px] gap-3 px-4 py-3 items-center text-sm hover:bg-[#F6F4E9] transition-colors cursor-pointer ${isSelected ? "bg-[#E6E8D2]" : ""}`}
                  onClick={() => toggleSelect(file.key)}
                >
                  <button
                    type="button"
                    className="w-5 h-5 flex items-center justify-center"
                    aria-label={isSelected ? "Deselect" : "Select"}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#4B5320]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#8A8A72]" />
                    )}
                  </button>
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-[#4B5320] shrink-0" />
                    <span className="truncate text-[#2A311A] font-medium">{file.name}</span>
                  </div>
                  <span className="text-xs text-[#8A8A72]">
                    {file.type.split("/").pop()?.toUpperCase()}
                  </span>
                  <span className="text-right text-[#57604A] text-xs">
                    {formatBytes(file.size)}
                  </span>
                  <span className="text-right text-[#8A8A72] text-xs">
                    {formatDate(file.lastModified)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
