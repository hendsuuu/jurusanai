"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { AdminOverview } from "../types";

const TOKENS = {
  brand: "#4B5320",
  brandLight: "#8E9A57",
  cyan: "#6F7D3E",
  teal: "#545E2E",
  amber: "#C9A24E",
  red: "#B3402E",
  slate: "#8A8A72",
  green: "#4B7A2F",
};

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: TOKENS.green,
  PENDING: TOKENS.amber,
  FAILED: TOKENS.red,
  EXPIRED: TOKENS.slate,
  CANCELED: "#6E725A",
};

const PACKAGE_COLORS: Record<string, string> = {
  BASIC: TOKENS.cyan,
  PREMIUM: TOKENS.brand,
  PRO: TOKENS.teal,
};

function formatShortDate(dateKey: string): string {
  // dateKey is `YYYY-MM-DD`. Render as `DD MMM` for axis labels.
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return dateKey;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

function formatRevenueShort(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}rb`;
  return String(value);
}

type TooltipPayloadItem = {
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
  color?: string;
};

type ChartTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: TooltipPayloadItem[];
};

function ChartTooltip(props: ChartTooltipProps) {
  const { active, payload, label } = props;
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-slate-900 mb-1">
        {typeof label === "string" ? formatShortDate(label) : label}
      </p>
      {payload.map((p, idx) => {
        const isMoney = p.dataKey === "revenue";
        const num = typeof p.value === "number" ? p.value : Number(p.value ?? 0);
        return (
          <div
            key={`${String(p.dataKey)}-${idx}`}
            className="flex items-center gap-2"
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: p.color }}
            />
            <span className="text-slate-600 capitalize">{String(p.name ?? p.dataKey)}:</span>
            <span className="font-semibold text-slate-900">
              {isMoney ? formatCurrency(num) : num}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function RevenueLineChart({
  data,
}: {
  data: AdminOverview["revenueSeries"];
}) {
  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Revenue 30 hari terakhir
          </h3>
          <p className="text-xs text-slate-500">
            Akumulasi pembayaran sukses per hari
          </p>
        </div>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#DDD9BD" />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              tick={{ fontSize: 10, fill: "#6E725A" }}
              stroke="#C7C3A2"
              minTickGap={20}
            />
            <YAxis
              tickFormatter={formatRevenueShort}
              tick={{ fontSize: 10, fill: "#6E725A" }}
              stroke="#C7C3A2"
              width={50}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke={TOKENS.brand}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function OrdersBarChart({
  data,
}: {
  data: AdminOverview["revenueSeries"];
}) {
  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Order sukses harian
          </h3>
          <p className="text-xs text-slate-500">
            Jumlah order yang dibayar tiap hari
          </p>
        </div>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#DDD9BD" />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              tick={{ fontSize: 10, fill: "#6E725A" }}
              stroke="#C7C3A2"
              minTickGap={20}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "#6E725A" }}
              stroke="#C7C3A2"
              width={32}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="orders"
              name="Orders"
              fill={TOKENS.cyan}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function StatusBreakdownPie({
  data,
}: {
  data: AdminOverview["statusBreakdown"];
}) {
  const items = data.filter((d) => d.orders > 0);

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Distribusi status order
        </h3>
        <p className="text-xs text-slate-500">Semua order dari semua waktu</p>
      </div>
      <div className="h-[260px] w-full">
        {items.length === 0 ? (
          <p className="h-full flex items-center justify-center text-sm text-slate-400">
            Belum ada order.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={items}
                dataKey="orders"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
              >
                {items.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] ?? TOKENS.slate}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  typeof value === "number" ? value : Number(value ?? 0),
                  String(name ?? ""),
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={28}
                iconSize={8}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export function PackageRevenueBar({
  data,
}: {
  data: AdminOverview["packageBreakdown"];
}) {
  const items = data.filter((d) => d.orders > 0);
  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Revenue per paket
        </h3>
        <p className="text-xs text-slate-500">
          Akumulasi revenue dari order sukses
        </p>
      </div>
      <div className="h-[260px] w-full">
        {items.length === 0 ? (
          <p className="h-full flex items-center justify-center text-sm text-slate-400">
            Belum ada penjualan.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={items}
              margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#DDD9BD" />
              <XAxis
                type="number"
                tickFormatter={formatRevenueShort}
                tick={{ fontSize: 10, fill: "#6E725A" }}
                stroke="#C7C3A2"
              />
              <YAxis
                type="category"
                dataKey="packageType"
                tick={{ fontSize: 11, fill: "#3F4A2E", fontWeight: 600 }}
                stroke="#C7C3A2"
                width={70}
              />
              <Tooltip
                formatter={(value, name) => {
                  const num =
                    typeof value === "number" ? value : Number(value ?? 0);
                  if (name === "revenue")
                    return [formatCurrency(num), "Revenue"];
                  return [num, String(name ?? "")];
                }}
              />
              <Bar
                dataKey="revenue"
                name="revenue"
                radius={[0, 4, 4, 0]}
                maxBarSize={32}
              >
                {items.map((entry) => (
                  <Cell
                    key={entry.packageType}
                    fill={PACKAGE_COLORS[entry.packageType] ?? TOKENS.brand}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
