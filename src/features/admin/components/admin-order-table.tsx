"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { CurrencyText } from "@/components/shared/currency-text";
import { formatDate } from "@/lib/format";
import { AdminPagination } from "./admin-pagination";
import { useAdminOrders } from "../hooks/use-admin-queries";
import { useSearchParamsState } from "../hooks/use-search-params-state";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import type { AdminOrderItem } from "../types";

const STATUSES = ["", "PENDING", "SUCCESS", "FAILED", "EXPIRED", "CANCELED"];

export function AdminOrderTable() {
  const { searchParams, setParams } = useSearchParamsState();
  const page = Number(searchParams.get("page") ?? 1);
  const status = searchParams.get("status") ?? "";
  const initialSearch = searchParams.get("search") ?? "";

  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(search, 350);

  useEffect(() => {
    if (debouncedSearch !== initialSearch) {
      setParams({ search: debouncedSearch || undefined, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const query = useAdminOrders({
    page,
    limit: 10,
    status: status || undefined,
    search: debouncedSearch || undefined,
  });

  const columns = useMemo<ColumnDef<AdminOrderItem>[]>(
    () => [
      {
        accessorKey: "orderCode",
        header: "Order Code",
        cell: ({ row }) => (
          <Link
            href={`/dashboard/orders/${row.original.id}`}
            className="font-mono text-xs text-brand-700 hover:underline"
          >
            {row.original.orderCode}
          </Link>
        ),
      },
      {
        id: "businessIdea",
        header: "Personality",
        cell: ({ row }) =>
          row.original.discoveryResult?.personalityTitle ?? "-",
      },
      {
        id: "planStatus",
        header: "Pipeline",
        cell: ({ row }) => (
          <StatusBadge status={row.original.discoveryResult?.status ?? "DRAFT"} />
        ),
      },
      {
        accessorKey: "packageType",
        header: "Paket",
        cell: ({ row }) => <Badge variant="outline">{row.original.packageType}</Badge>,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => <CurrencyText value={row.original.amount} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "customerEmail",
        header: "Customer",
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="text-slate-900">
              {row.original.customerName ?? "-"}
            </p>
            <p className="text-slate-500 text-xs">
              {row.original.customerEmail ?? "-"}
            </p>
          </div>
        ),
      },
      {
        id: "email",
        header: "Email PDF",
        cell: ({ row }) => {
          const s = row.original.emailStatus;
          if (!s)
            return (
              <Badge variant="neutral" className="text-[10px]">
                Belum
              </Badge>
            );
          if (s === "SENT")
            return (
              <Badge variant="success" className="text-[10px]">
                Terkirim
              </Badge>
            );
          if (s === "FAILED")
            return (
              <Badge variant="danger" className="text-[10px]">
                Gagal
              </Badge>
            );
          if (s === "BOUNCED")
            return (
              <Badge variant="warning" className="text-[10px]">
                Bounced
              </Badge>
            );
          return (
            <Badge variant="warning" className="text-[10px]">
              Pending
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "action",
        header: "",
        cell: ({ row }) => (
          <Link
            href={`/dashboard/orders/${row.original.id}`}
            className="text-sm text-brand-700 hover:underline"
          >
            Detail
          </Link>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: query.data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari order code / email / nama"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) =>
            setParams({ status: e.target.value || undefined, page: 1 })
          }
          className="sm:w-48"
        >
          {STATUSES.map((s) => (
            <option key={s || "ALL"} value={s}>
              {s || "Semua status"}
            </option>
          ))}
        </Select>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="text-left">
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {query.isLoading ? (
                <SkeletonRows />
              ) : query.isError ? (
                <tr>
                  <td colSpan={columns.length} className="p-6">
                    <ErrorState onRetry={() => query.refetch()} />
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-6">
                    <EmptyState
                      title="Belum ada order"
                      description="Belum ada order untuk filter ini."
                    />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-slate-100 hover:bg-slate-50/60:bg-slate-800/40"
                  >
                    {row.getVisibleCells().map((c) => (
                      <td key={c.id} className="px-4 py-3 align-top">
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {query.data ? (
        <AdminPagination
          page={query.data.meta.page}
          total={query.data.meta.total}
          totalPage={query.data.meta.totalPage}
          onPageChange={(p) => setParams({ page: p })}
        />
      ) : null}
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-t border-slate-100">
          {Array.from({ length: 10 }).map((__, j) => (
            <td key={j} className="px-4 py-3">
              <Skeleton className="h-4 w-full max-w-[140px]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
