"use client";

import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Wallet,
  PieChart,
  FileText,
} from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { useAdminOverview } from "../hooks/use-admin-queries";
import { formatCurrency, formatPercentage } from "@/lib/format";
import {
  RevenueLineChart,
  OrdersBarChart,
  StatusBreakdownPie,
  PackageRevenueBar,
} from "./overview-charts";

export function OverviewView() {
  const { data, isLoading, isError, refetch } = useAdminOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Ringkasan order, hasil analisis, dan revenue."
      />
      {isLoading ? (
        <LoadingState message="Memuat data overview…" rows={3} />
      ) : isError || !data ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard
              label="Total Orders"
              value={data.totalOrders}
              icon={<ShoppingBag className="w-5 h-5" />}
            />
            <MetricCard
              label="Success"
              value={data.successOrders}
              icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
            />
            <MetricCard
              label="Pending"
              value={data.pendingOrders}
              icon={<Clock className="w-5 h-5 text-amber-600" />}
            />
            <MetricCard
              label="Failed / Expired"
              value={
                data.failedOrders + data.expiredOrders + data.canceledOrders
              }
              icon={<XCircle className="w-5 h-5 text-red-500" />}
            />
            <MetricCard
              label="Total Revenue"
              value={formatCurrency(data.totalRevenue)}
              icon={<Wallet className="w-5 h-5" />}
            />
            <MetricCard
              label="Total Analisis"
              value={data.totalPlans}
              icon={<FileText className="w-5 h-5" />}
            />
            <MetricCard
              label="Conversion"
              value={formatPercentage(data.conversionRate)}
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <MetricCard
              label="Net Revenue / Order"
              value={
                data.successOrders
                  ? formatCurrency(data.totalRevenue / data.successOrders)
                  : "-"
              }
              icon={<PieChart className="w-5 h-5" />}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <RevenueLineChart data={data.revenueSeries} />
            <OrdersBarChart data={data.revenueSeries} />
            <StatusBreakdownPie data={data.statusBreakdown} />
            <PackageRevenueBar data={data.packageBreakdown} />
          </div>
        </>
      )}
    </div>
  );
}
