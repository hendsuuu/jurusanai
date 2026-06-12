"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { logoutAction } from "@/app/dashboard/actions";
import { cn } from "@/lib/utils";

type Variant = "sidebar" | "menu-item";

/**
 * Logout button with confirmation dialog. Used in the sidebar bottom
 * card and the topbar dropdown. Variant controls the visual style.
 */
export function LogoutButton({
  className,
  variant = "sidebar",
}: {
  className?: string;
  variant?: Variant;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await logoutAction();
      // Server action redirects, so this rarely runs — but in case it does:
      setOpen(false);
    });
  }

  return (
    <>
      {variant === "sidebar" ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("w-full justify-start", className)}
          onClick={() => setOpen(true)}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors",
            className
          )}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      )}

      <ConfirmDialog
        open={open}
        onClose={() => {
          if (!isPending) setOpen(false);
        }}
        onConfirm={handleConfirm}
        title="Logout dari dashboard?"
        description="Kamu akan keluar dari sesi admin dan diarahkan ke halaman login."
        confirmLabel={isPending ? "Logging out…" : "Ya, Logout"}
        cancelLabel="Batal"
        variant="danger"
        loading={isPending}
        icon={<LogOut className="w-5 h-5 text-[#DC2626]" />}
      />
    </>
  );
}
