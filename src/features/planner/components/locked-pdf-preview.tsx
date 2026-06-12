import { Lock } from "lucide-react";

const FREE_ITEMS = [
  "Personality identity",
  "Top 3 jurusan teaser",
  "Ringkasan arah awal",
];

const FULL_REPORT_ITEMS = [
  "PDF self discovery report lengkap",
  "Personality breakdown lengkap",
  "Strength & weakness mendalam",
  "Top 5 jurusan + alasan kecocokan",
  "Future lifestyle compatibility",
  "Career direction & simulasi masa depan",
  "Warning area yang perlu dihindari",
  "Skill roadmap bertahap",
  "Self development advice personal",
];

export function LockedPdfPreview() {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="p-6 sm:p-8 space-y-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Free Overview
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {FREE_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Lock
                  className="w-4 h-4 mt-0.5 text-brand-600 shrink-0"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-slate-100 pt-5">
          <p className="text-xs font-medium uppercase tracking-wider text-brand-700">
            Expert Deep Report - Rp99.000
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {FULL_REPORT_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Lock
                  className="w-4 h-4 mt-0.5 text-brand-600 shrink-0"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
    </div>
  );
}
