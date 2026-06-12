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
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { AdminPagination } from "./admin-pagination";
import { useAdminPlans } from "../hooks/use-admin-queries";
import { useSearchParamsState } from "../hooks/use-search-params-state";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import type { AdminPlanItem } from "../types";

const STATUSES = [
  "",
  "DRAFT",
  "RECOMMENDED",
  "SELECTED",
  "GENERATED",
  "PAID",
  "PDF_READY",
  "FAILED",
];

export function AdminPlanTable() {
  const { searchParams, setParams } = useSearchParamsState();
  const page = Number(searchParams.get("page") ?? 1);
  const status = searchParams.get("status") ?? "";
  const initialSearch = searchParams.get("search") ?? "";

  const [search, setSearch] = useState(initialSearch);
  const debounced = useDebouncedValue(search, 350);

  useEffect(() => {
    if (debounced !== initialSearch) {
      setParams({ search: debounced || undefined, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const query = useAdminPlans({
    page,
    limit: 10,
    status: status || undefined,
    search: debounced || undefined,
  });

  const columns = useMemo<ColumnDef<AdminPlanItem>[]>(
    () => [
      {
        id: "idea",
        header: "Personality / Jurusan",
        cell: ({ row }) => (
          <Link
            href={`/dashboard/plans/${row.original.id}`}
            className="text-brand-700 hover:underline"
          >
            {row.original.personalityTitle ?? "(belum dipilih)"}
          </Link>
        ),
      },
      {
        accessorKey: "interestArea",
        header: "Minat",
        cell: ({ row }) => <Badge variant="outline">{row.original.interestArea}</Badge>,
      },
      { accessorKey: "studentName", header: "Nama Siswa" },
      { accessorKey: "dailyEnergy", header: "Daily Energy" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "orderCount",
        header: "Orders",
        cell: ({ row }) => row.original._count.orders,
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
            placeholder="Cari personality / jurusan / sekolah"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) =>
            setParams({ status: e.target.value || undefined, page: 1 })
          }
          className="sm:w-56"
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
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 max-w-[140px]" />
                      </td>
                    ))}
                  </tr>
                ))
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
                      title="Belum ada hasil"
                      description="Belum ada hasil analisis untuk filter ini."
                    />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-slate-100 hover:bg-slate-50/60"
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
