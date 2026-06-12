import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { AdminOrderTable } from "@/features/admin/components/admin-order-table";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  return (
    <div>
      <PageHeader title="Orders" description="Manajemen order pembayaran." />
      <AdminOrderTable />
    </div>
  );
}
