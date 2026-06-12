"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

async function changePassword(payload: ChangePasswordPayload) {
  const res = await fetch("/api/admin/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Gagal mengubah password");
  return json.data;
}

export function ChangePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ChangePasswordPayload>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password berhasil diubah. Silakan login kembali.");
      reset();
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  function reset() {
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  }

  // ESC to close + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !mutation.isPending) {
        reset();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, mutation.isPending]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    mutation.mutate(form);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={() => {
          if (!mutation.isPending) {
            reset();
            onClose();
          }
        }}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#DDD9BD] shadow-[0_24px_70px_rgba(15,23,42,0.16)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#DDD9BD] flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6E8D2] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-[#4B5320]" />
            </div>
            <div>
              <h2
                id="change-password-title"
                className="text-lg font-bold text-[#2A311A] tracking-tight"
              >
                Ubah Password
              </h2>
              <p className="mt-0.5 text-xs text-[#57604A]">
                Masukkan password lama untuk verifikasi.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            disabled={mutation.isPending}
            onClick={() => {
              reset();
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#8A8A72] hover:bg-[#F0EEDD] hover:text-[#2A311A] disabled:opacity-50 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <PasswordField
            id="current-password"
            label="Password Lama"
            value={form.currentPassword}
            onChange={(v) => setForm((p) => ({ ...p, currentPassword: v }))}
            show={showCurrent}
            onToggle={() => setShowCurrent((v) => !v)}
            disabled={mutation.isPending}
            autoComplete="current-password"
            autoFocus
          />
          <PasswordField
            id="new-password"
            label="Password Baru"
            value={form.newPassword}
            onChange={(v) => setForm((p) => ({ ...p, newPassword: v }))}
            show={showNew}
            onToggle={() => setShowNew((v) => !v)}
            disabled={mutation.isPending}
            autoComplete="new-password"
            hint="Minimal 8 karakter, beda dengan password lama."
          />
          <PasswordField
            id="confirm-password"
            label="Konfirmasi Password Baru"
            value={form.confirmPassword}
            onChange={(v) => setForm((p) => ({ ...p, confirmPassword: v }))}
            show={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
            disabled={mutation.isPending}
            autoComplete="new-password"
          />

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => {
                reset();
                onClose();
              }}
              disabled={mutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Simpan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  disabled,
  autoComplete,
  autoFocus,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  disabled?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className="pr-10"
        />
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[#8A8A72] hover:text-[#2A311A] hover:bg-[#F0EEDD] disabled:opacity-50 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint ? <p className="text-[11px] text-[#8A8A72]">{hint}</p> : null}
    </div>
  );
}
