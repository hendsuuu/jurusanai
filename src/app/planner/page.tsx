import type { Metadata } from "next";
import { PlannerWizard } from "@/features/planner/components/planner-wizard";

export const metadata: Metadata = {
  title: "Mulai Analisis Diri",
  description:
    "Jawab pertanyaan singkat dan temukan kepribadian serta jurusan yang paling cocok buatmu.",
};

export default function PlannerPage() {
  return <PlannerWizard />;
}
