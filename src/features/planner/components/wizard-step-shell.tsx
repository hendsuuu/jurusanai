"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function WizardStepShell({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="space-y-3 sm:space-y-4"
    >
      <div>
        <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-snug">
          {title}
        </h2>
        {hint ? (
          <p className="text-[12px] sm:text-sm text-white/65 mt-1 max-w-xl leading-snug">
            {hint}
          </p>
        ) : null}
      </div>
      <div>{children}</div>
    </motion.div>
  );
}
