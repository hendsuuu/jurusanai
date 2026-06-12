import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { AdminLogTable } from "@/features/admin/components/admin-log-table";

export const metadata: Metadata = { title: "Audit Logs" };

export default function LogsPage() {
  return (
    <div>
      <PageHeader title="Audit Logs" description="Riwayat aktivitas sistem." />
      <AdminLogTable />
    </div>
  );
}
