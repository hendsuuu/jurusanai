import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { AdminPlanTable } from "@/features/admin/components/admin-plan-table";

export const metadata: Metadata = { title: "Hasil Analisis" };

export default function PlansPage() {
  return (
    <div>
      <PageHeader
        title="Hasil Analisis"
        description="Daftar hasil self discovery yang sudah dibuat user."
      />
      <AdminPlanTable />
    </div>
  );
}
