import type { Metadata } from "next";
import { SupportTicketDetailView } from "@/features/admin/components/support-ticket-detail-view";

export const metadata: Metadata = { title: "Detail Ticket" };

export default async function SupportTicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  return <SupportTicketDetailView ticketId={ticketId} />;
}
