"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, KeyRound, LogOut } from "lucide-react";
import { ChangePasswordModal } from "./change-password-modal";
import { LogoutButton } from "./logout-button";

type AdminUser = {
  name: string | null;
  email: string;
};

export function AdminTopbar({ user }: { user: AdminUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  // Close menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const initials = getInitials(user.name ?? user.email);

  return (
    <>
      <header className="sticky top-0 z-30 hidden lg:flex items-center justify-end h-16 bg-white border-b border-slate-200 px-6">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2.5 rounded-full pl-1.5 pr-3 py-1.5 hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#4B5320] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[160px]">
                {user.name ?? "Superadmin"}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight truncate max-w-[160px]">
                {user.email}
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown menu */}
          {menuOpen ? (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.12)] overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#E6E8D2] text-[#4B5320] flex items-center justify-center text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {user.name ?? "Superadmin"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setPasswordOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-[#E6E8D2] hover:text-[#4B5320] transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                  Ubah Password
                </button>
                <LogoutButton variant="menu-item" />
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <ChangePasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
    </>
  );
}

function getInitials(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "AD";
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  // Single word — use first 2 chars
  const before = trimmed.split("@")[0];
  return before.slice(0, 2).toUpperCase();
}
