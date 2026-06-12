import { prisma } from "@/lib/prisma";
import type {
  AuditAction,
  OrderStatus,
  DiscoveryStatus,
  Prisma,
} from "@prisma/client";

export async function getOverview() {
  const [
    totalOrders,
    successOrders,
    pendingOrders,
    failedOrders,
    expiredOrders,
    canceledOrders,
    revenueAgg,
    totalPlans,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "SUCCESS" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "FAILED" } }),
    prisma.order.count({ where: { status: "EXPIRED" } }),
    prisma.order.count({ where: { status: "CANCELED" } }),
    prisma.order.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    }),
    prisma.discoveryResult.count(),
  ]);

  const totalRevenue = revenueAgg._sum.amount ?? 0;
  const conversionRate =
    totalOrders > 0
      ? Number(((successOrders / totalOrders) * 100).toFixed(2))
      : 0;

  // Time-series data for the last 30 days. We do the aggregation in
  // application code (not raw SQL) so the same logic works on Postgres
  // and on a future SQLite-based dev DB if ever needed.
  const { revenueSeries, packageBreakdown, statusBreakdown } =
    await getOverviewSeries();

  return {
    totalOrders,
    successOrders,
    pendingOrders,
    failedOrders,
    expiredOrders,
    canceledOrders,
    totalRevenue,
    totalPlans,
    conversionRate,
    revenueSeries,
    packageBreakdown,
    statusBreakdown,
  };
}

/**
 * Aggregated time-series data for charts on the admin overview page.
 * - revenueSeries: revenue + order count per day for last 30 days
 * - packageBreakdown: SUCCESS orders grouped by packageType
 * - statusBreakdown: all orders grouped by status (totals)
 */
async function getOverviewSeries() {
  const now = new Date();
  const since = new Date(now);
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);

  const [recentSuccessOrders, packageGroups, statusGroups] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: "SUCCESS",
        paidAt: { gte: since },
      },
      select: { paidAt: true, amount: true },
    }),
    prisma.order.groupBy({
      by: ["packageType"],
      where: { status: "SUCCESS" },
      _count: { _all: true },
      _sum: { amount: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  // Build a contiguous 30-day series so the chart line never has gaps.
  const buckets = new Map<string, { revenue: number; orders: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = formatDateKey(d);
    buckets.set(key, { revenue: 0, orders: 0 });
  }

  for (const o of recentSuccessOrders) {
    if (!o.paidAt) continue;
    const key = formatDateKey(o.paidAt);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.revenue += o.amount;
    bucket.orders += 1;
  }

  const revenueSeries = Array.from(buckets.entries()).map(([date, v]) => ({
    date,
    revenue: v.revenue,
    orders: v.orders,
  }));

  const packageBreakdown = packageGroups.map((g) => ({
    packageType: g.packageType,
    orders: g._count._all,
    revenue: g._sum.amount ?? 0,
  }));

  const statusBreakdown = statusGroups.map((g) => ({
    status: g.status,
    orders: g._count._all,
  }));

  return { revenueSeries, packageBreakdown, statusBreakdown };
}

function formatDateKey(d: Date): string {
  // YYYY-MM-DD in local time so the bucketing is consistent with the
  // admin's own day boundaries.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export type ListOrdersArgs = {
  page: number;
  limit: number;
  status?: OrderStatus;
  search?: string;
};

export async function listOrders(args: ListOrdersArgs) {
  const where: Prisma.OrderWhereInput = {};
  if (args.status) where.status = args.status;
  if (args.search) {
    where.OR = [
      { orderCode: { contains: args.search, mode: "insensitive" } },
      { customerEmail: { contains: args.search, mode: "insensitive" } },
      { customerName: { contains: args.search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (args.page - 1) * args.limit,
      take: args.limit,
      include: {
        discoveryResult: {
          select: {
            id: true,
            personalityTitle: true,
            status: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items,
    meta: {
      page: args.page,
      limit: args.limit,
      total,
      totalPage: Math.max(1, Math.ceil(total / args.limit)),
    },
  };
}

export async function getOrderDetail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      discoveryResult: true,
      user: {
        select: { id: true, email: true, name: true, role: true },
      },
    },
  });
  if (!order) return null;

  const auditLogs = await prisma.auditLog.findMany({
    where: { entityType: "Order", entityId: order.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return { order, auditLogs };
}

export type ListPlansArgs = {
  page: number;
  limit: number;
  status?: DiscoveryStatus;
  search?: string;
};

export async function listPlans(args: ListPlansArgs) {
  const where: Prisma.DiscoveryResultWhereInput = {};
  if (args.status) where.status = args.status;
  if (args.search) {
    where.OR = [
      { personalityTitle: { contains: args.search, mode: "insensitive" } },
      { studentName: { contains: args.search, mode: "insensitive" } },
      { school: { contains: args.search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.discoveryResult.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (args.page - 1) * args.limit,
      take: args.limit,
      include: {
        _count: { select: { orders: true } },
      },
    }),
    prisma.discoveryResult.count({ where }),
  ]);

  return {
    items,
    meta: {
      page: args.page,
      limit: args.limit,
      total,
      totalPage: Math.max(1, Math.ceil(total / args.limit)),
    },
  };
}

export type ListLogsArgs = {
  page: number;
  limit: number;
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
};

export async function listLogs(args: ListLogsArgs) {
  const where: Prisma.AuditLogWhereInput = {};
  if (args.action) where.action = args.action;
  if (args.entityType) where.entityType = args.entityType;
  if (args.entityId) where.entityId = args.entityId;

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (args.page - 1) * args.limit,
      take: args.limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    items,
    meta: {
      page: args.page,
      limit: args.limit,
      total,
      totalPage: Math.max(1, Math.ceil(total / args.limit)),
    },
  };
}
