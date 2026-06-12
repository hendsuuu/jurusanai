"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Ticket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { AdminPagination } from "./admin-pagination";
import { useSearchParamsState } from "../hooks/use-search-params-state";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { formatDate } from "@/lib/format";

const STATUSES = ["", "OPEN", "IN_PROGRESS", "WAITING_USER", "RESOLVED", "CLOSED", "SPAM"];
const PRIORITIES = ["", "LOW", "NORMAL", "HIGH", "URGENT"];

type TicketItem = {
  id: string;
  ticketNumber: string;
  fromEmail: string;
  fromName: string | null;
  subject: string;
  status: string;
  priority: string;
  source: string;
  createdAt: string;
};

type TicketsResponse = {
  items: TicketItem[];
  meta: { page: number; limit: number; total: number; totalPage: number };
};

function statusVariant(s: string) {
  switch (s) {
    case "OPEN": return "info";
    case "IN_PROGRESS": return "warning";
    case "WAITING_USER": return "neutral";
    case "RESOLVED": return "success";
    case "CLOSED": return "neutral";
    case "SPAM": return "danger";
    default: return "neutral";
  }
}

function priorityVariant(p: string) {
  switch (p) {
    case "URGENT": return "danger";
    case "HIGH": return "warning";
    case "NORMAL": return "info";
    case "LOW": return "neutral";
    default: return "neutral";
  }
}

export function SupportTicketList() {
  const { searchParams, setParams } = useSearchParamsState();
  const page = Number(searchParams.get("page") ?? 1);
  const status = searchParams.get("status") ?? "";
  const priority = searchParams.get("priority") ?? "";
  const initialSearch = searchParams.get("search") ?? "";

  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(search, 350);

  useEffect(() => {
    if (debouncedSearch !== initialSearch) {
      setParams({ search: debouncedSearch || undefined, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const query = useQuery<TicketsResponse>({
    queryKey: ["admin", "support-tickets", { page, status, priority, search: debouncedSearch }],
    queryFn: () => {
      const sp = new URLSearchParams();
      sp.set("page", String(page));
      sp.set("limit", "20");
      if (status) sp.set("status", status);
      if (priority) sp.set("priority", priority);
      if (debouncedSearch) sp.set("search", debouncedSearch);
      return apiClient<TicketsResponse>(`/api/admin/support-tickets?${sp.toString()}`);
    },
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Support Tickets"
        description="Email masuk dari user yang membutuhkan bantuan."
        action={
          <Badge variant="info">
            <Ticket className="w-3 h-3" />
            {query.data?.meta.total ?? 0} total
          </Badge>
        }
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ticket number / email / subject"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setParams({ status: e.target.value || undefined, page: 1 })}
          className="sm:w-44"
        >
          {STATUSES.map((s) => (
            <option key={s || "ALL"} value={s}>{s || "Semua status"}</option>
          ))}
        </Select>
        <Select
          value={priority}
          onChange={(e) => setParams({ priority: e.target.value || undefined, page: 1 })}
          className="sm:w-40"
        >
          {PRIORITIES.map((p) => (
            <option key={p || "ALL"} value={p}>{p || "Semua priority"}</option>
          ))}
        </Select>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Ticket</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">From</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full max-w-[140px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : query.isError ? (
                <tr>
                  <td colSpan={7} className="p-6">
                    <ErrorState onRetry={() => query.refetch()} />
                  </td>
                </tr>
              ) : !query.data?.items.length ? (
                <tr>
                  <td colSpan={7} className="p-6">
                    <EmptyState title="Belum ada ticket" description="Belum ada email support masuk." />
                  </td>
                </tr>
              ) : (
                query.data.items.map((t) => (
                  <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/support-tickets/${t.id}`}
                        className="font-mono text-xs text-brand-700 hover:underline"
                      >
                        {t.ticketNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 max-w-[240px] truncate text-slate-900">
                      {t.subject}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="text-slate-900">{t.fromName ?? "-"}</p>
                        <p className="text-slate-500 text-xs">{t.fromEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(t.status) as "info" | "warning" | "success" | "danger" | "neutral"}>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={priorityVariant(t.priority) as "info" | "warning" | "success" | "danger" | "neutral"}>
                        {t.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/support-tickets/${t.id}`}
                        className="text-sm text-brand-700 hover:underline"
                      >
                        Detail
                      </Link>
                    </td>
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
