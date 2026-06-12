import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/format";
import type { OrderDetailResponse } from "../types";

export function OrderSummaryCard({ order }: { order: OrderDetailResponse }) {
  return (
    <div className="rounded-3xl border border-[#DDD9BD] bg-white p-5 sm:p-6 space-y-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#8A8A72] font-semibold">
            Order Code
          </p>
          <p className="font-mono text-sm text-[#2A311A] font-medium">{order.orderCode}</p>
        </div>
        <StatusBadge status={order.status} />
      </header>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-[#F6F4E9] border border-[#DDD9BD] p-3">
          <dt className="text-[#8A8A72] text-[10px] uppercase tracking-wider font-semibold">Paket</dt>
          <dd className="font-semibold mt-1 text-[#2A311A]">
            <Badge variant="blue">{order.packageType}</Badge>
          </dd>
        </div>
        <div className="rounded-xl bg-[#F6F4E9] border border-[#DDD9BD] p-3">
          <dt className="text-[#8A8A72] text-[10px] uppercase tracking-wider font-semibold">Total bayar</dt>
          <dd className="font-bold mt-1 text-[#2A311A]">{formatCurrency(order.amount)}</dd>
        </div>
        <div className="col-span-2 rounded-xl bg-[#F6F4E9] border border-[#DDD9BD] p-3">
          <dt className="text-[#8A8A72] text-[10px] uppercase tracking-wider font-semibold">Ide bisnis</dt>
          <dd className="font-medium mt-1 text-[#2A311A]">
            {order.discoveryResult.selectedIdeaName ?? "-"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
