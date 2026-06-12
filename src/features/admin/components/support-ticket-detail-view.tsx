"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { formatDate } from "@/lib/format";
import { apiClient } from "@/lib/api-client";

type Reply = {
  id: string;
  senderType: "USER" | "ADMIN" | "SYSTEM";
  senderEmail: string | null;
  senderName: string | null;
  messageText: string | null;
  messageHtml: string | null;
  createdAt: string;
};

type TicketDetail = {
  id: string;
  ticketNumber: string;
  fromEmail: string;
  fromName: string | null;
  toEmail: string;
  subject: string;
  messageText: string | null;
  messageHtml: string | null;
  status: string;
  priority: string;
  source: string;
  userId: string | null;
  orderId: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  replies: Reply[];
};

const STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_USER", "RESOLVED", "CLOSED", "SPAM"];
const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];

export function SupportTicketDetailView({ ticketId }: { ticketId: string }) {
  const qc = useQueryClient();
  const [replyText, setReplyText] = useState("");

  const query = useQuery<TicketDetail>({
    queryKey: ["admin", "support-ticket", ticketId],
    queryFn: () => apiClient<TicketDetail>(`/api/admin/support-tickets/${ticketId}`),
    enabled: Boolean(ticketId),
  });

  const updateMutation = useMutation({
    mutationFn: (body: Record<string, string>) =>
      apiClient(`/api/admin/support-tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "support-ticket", ticketId] });
    },
  });

  if (query.isLoading) return <LoadingState message="Memuat ticket…" />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => query.refetch()} />;

  const ticket = query.data;

  async function handleReply() {
    if (!replyText.trim()) return;
    try {
      await updateMutation.mutateAsync({ reply: replyText.trim() });
      setReplyText("");
      toast.success("Balasan terkirim.");
    } catch {
      toast.error("Gagal mengirim balasan.");
    }
  }

  async function handleStatusChange(status: string) {
    try {
      await updateMutation.mutateAsync({ status });
      toast.success(`Status diubah ke ${status}`);
    } catch {
      toast.error("Gagal mengubah status.");
    }
  }

  async function handlePriorityChange(priority: string) {
    try {
      await updateMutation.mutateAsync({ priority });
      toast.success(`Priority diubah ke ${priority}`);
    } catch {
      toast.error("Gagal mengubah priority.");
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/support-tickets"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Support Tickets
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Ticket</p>
          <h1 className="text-xl font-bold font-mono text-slate-900">
            {ticket.ticketNumber}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{formatDate(ticket.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-40 h-9 text-xs"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select
            value={ticket.priority}
            onChange={(e) => handlePriorityChange(e.target.value)}
            className="w-32 h-9 text-xs"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Ticket info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5 space-y-2">
          <h2 className="font-semibold text-slate-900 text-sm">Pengirim</h2>
          <Field label="Email" value={ticket.fromEmail} />
          <Field label="Nama" value={ticket.fromName} />
          <Field label="Source" value={ticket.source} />
          {ticket.orderId ? (
            <Field
              label="Order"
              value={
                <Link href={`/dashboard/orders/${ticket.orderId}`} className="text-brand-700 hover:underline text-xs">
                  Lihat Order
                </Link>
              }
            />
          ) : null}
        </Card>
        <Card className="p-5 space-y-2">
          <h2 className="font-semibold text-slate-900 text-sm">Status</h2>
          <Field label="Status" value={<Badge variant="info">{ticket.status}</Badge>} />
          <Field label="Priority" value={<Badge variant="warning">{ticket.priority}</Badge>} />
          <Field label="First Response" value={ticket.firstResponseAt ? formatDate(ticket.firstResponseAt) : "-"} />
          <Field label="Resolved" value={ticket.resolvedAt ? formatDate(ticket.resolvedAt) : "-"} />
        </Card>
      </div>

      {/* Original message */}
      <Card className="p-5">
        <h2 className="font-semibold text-slate-900 mb-2">
          {ticket.subject}
        </h2>
        <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
          {ticket.messageText ?? "(Tidak ada isi teks)"}
        </div>
      </Card>

      {/* Replies thread */}
      {ticket.replies.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 text-sm">Riwayat Balasan</h3>
          {ticket.replies.map((r) => (
            <Card
              key={r.id}
              className={`p-4 ${r.senderType === "ADMIN" ? "border-l-4 border-l-brand-500" : "border-l-4 border-l-slate-300"}`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={r.senderType === "ADMIN" ? "info" : "neutral"}>
                    {r.senderType}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {r.senderEmail ?? r.senderName ?? "Unknown"}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {r.messageText ?? "(Tidak ada isi)"}
              </p>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Reply form */}
      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 text-sm mb-3">Balas Ticket</h3>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Tulis balasan untuk user..."
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:border-transparent resize-y"
        />
        <div className="mt-3 flex justify-end">
          <Button
            onClick={handleReply}
            disabled={!replyText.trim() || updateMutation.isPending}
            loading={updateMutation.isPending}
            size="sm"
          >
            <Send className="w-3.5 h-3.5" />
            Kirim Balasan
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="col-span-2 text-slate-900 truncate">{value || "-"}</dd>
    </div>
  );
}
