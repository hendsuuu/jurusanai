"use client";

import { useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { AdminPagination } from "./admin-pagination";
import { useAdminLogs } from "../hooks/use-admin-queries";
import { useSearchParamsState } from "../hooks/use-search-params-state";
import type { AdminLogItem } from "../types";

const ACTIONS = [
  "",
  "LOGIN",
  "LOGOUT",
  "CREATE_RECOMMENDATION",
  "SELECT_PERSONALITY",
  "GENERATE_REPORT",
  "CREATE_ORDER",
  "PAYMENT_SUCCESS",
  "PAYMENT_FAILED",
  "PAYMENT_EXPIRED",
  "PAYMENT_CANCELED",
  "GENERATE_PDF",
  "DOWNLOAD_PDF",
  "ADMIN_VIEW_ORDER",
  "ADMIN_UPDATE_ORDER",
];

export function AdminLogTable() {
  const { searchParams, setParams } = useSearchParamsState();
  const page = Number(searchParams.get("page") ?? 1);
  const action = searchParams.get("action") ?? "";

  const query = useAdminLogs({
    page,
    limit: 20,
    action: action || undefined,
  });

  const columns = useMemo<ColumnDef<AdminLogItem>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Time",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-600">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => <Badge variant="info">{row.original.action}</Badge>,
      },
      {
        id: "entity",
        header: "Entity",
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">
            {row.original.entityType ?? "-"}
            {row.original.entityId
              ? ` · ${row.original.entityId.slice(0, 12)}…`
              : ""}
          </span>
        ),
      },
      {
        accessorKey: "ipAddress",
        header: "IP",
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.ipAddress ?? "-"}</span>
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
        <Select
          value={action}
          onChange={(e) =>
            setParams({ action: e.target.value || undefined, page: 1 })
          }
          className="sm:w-72"
        >
          {ACTIONS.map((a) => (
            <option key={a || "ALL"} value={a}>
              {a || "Semua action"}
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
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {Array.from({ length: 4 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 max-w-[200px]" />
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
                    <EmptyState title="Belum ada log" />
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
