"use client";

import { useEffect, useRef, useState } from "react";
import { PLANNER_DRAFT_KEY } from "@/lib/constants";
import {
  initialPlannerValues,
  plannerWizardSchema,
  type PlannerWizardValues,
} from "../schemas/wizard-schema";

/**
 * Persist a wizard draft to localStorage so the user does not lose progress
 * on accidental refresh. Only safe (non-sensitive) wizard fields are stored.
 */
export function usePlannerDraft() {
  const [hydrated, setHydrated] = useState(false);
  const [values, setValues] = useState<PlannerWizardValues>(initialPlannerValues);
  const skipNextSave = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PLANNER_DRAFT_KEY);
      if (raw) {
        const parsed = plannerWizardSchema.partial().safeParse(JSON.parse(raw));
        if (parsed.success) {
          setValues((prev) => ({ ...prev, ...parsed.data }));
        }
      }
    } catch {
      // ignore corrupt draft
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    try {
      localStorage.setItem(PLANNER_DRAFT_KEY, JSON.stringify(values));
    } catch {
      // ignore quota errors
    }
  }, [values, hydrated]);

  function clearDraft() {
    try {
      localStorage.removeItem(PLANNER_DRAFT_KEY);
    } catch {
      // ignore
    }
  }

  return { values, setValues, hydrated, clearDraft };
}
