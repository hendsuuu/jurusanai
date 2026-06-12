"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  ScrollText,
  Settings,
  Menu,
  X,
  FlaskConical,
  Ticket,
  HardDrive,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";
import { AdminTopbar } from "./admin-topbar";
import { ChangePasswordModal } from "./change-password-modal";
import { LogoutButton } from "./logout-button";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/support-tickets", label: "Support Tickets", icon: Ticket },
  { href: "/dashboard/plans", label: "Hasil Analisis", icon: FileText },
  { href: "/dashboard/storage", label: "Storage", icon: HardDrive },
  { href: "/dashboard/logs", label: "Audit Logs", icon: ScrollText },
  { href: "/dashboard/pdf-test", label: "PDF Test", icon: FlaskConical },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string | null; email: string };
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePasswordOpen, setMobilePasswordOpen] = useState(false);

  return (
    <div className="flex flex-1 min-h-0">
      {/* Mobile topbar */}
      <div className="lg:hidden fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 h-14">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <BrandLogo size="sm" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Buka navigasi"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/50"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
              <span className="font-semibold text-slate-900">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Tutup"
                onClick={() => setMobileOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="shrink-0 border-t border-slate-200 p-4 space-y-2 bg-white">
              <p className="text-xs">
                <span className="block font-medium text-slate-900 truncate">
                  {user.name ?? "Superadmin"}
                </span>
                <span className="block text-slate-500 truncate">{user.email}</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setMobilePasswordOpen(true);
                }}
                className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-[#DDD9BD] text-sm font-medium text-[#2A311A] hover:bg-[#F0EEDD] hover:border-[#CDD2A8] transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                Ubah Password
              </button>
              <LogoutButton className="w-full" />
            </div>
          </aside>
        </div>
      ) : null}

      {/* Desktop sidebar — flex column with sticky logout at bottom */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white sticky top-0 h-screen">
        <div className="px-5 h-16 flex items-center border-b border-slate-200 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <BrandLogo size="sm" />
          </Link>
        </div>

        {/* Scrollable nav area */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav />
        </div>

        {/* Sticky bottom user card */}
        <div className="shrink-0 px-4 py-3 border-t border-slate-200 text-xs text-slate-600 bg-white">
          <p className="font-medium text-slate-900 truncate">
            {user.name ?? "Superadmin"}
          </p>
          <p className="truncate">{user.email}</p>
          <LogoutButton className="mt-3 w-full" />
        </div>
      </aside>

      <main className="flex-1 lg:pt-0 pt-14 bg-slate-50 min-w-0 flex flex-col">
        {/* Desktop topbar (sticky) */}
        <AdminTopbar user={user} />

        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1280px] mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile change-password modal (separate from topbar dropdown) */}
      <ChangePasswordModal
        open={mobilePasswordOpen}
        onClose={() => setMobilePasswordOpen(false)}
      />
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
              active
                ? "bg-[#E6E8D2] text-[#4B5320] font-medium"
                : "text-slate-700 hover:bg-slate-100"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
