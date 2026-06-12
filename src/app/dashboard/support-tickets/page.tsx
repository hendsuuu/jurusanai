import type { Metadata } from "next";
import { SupportTicketList } from "@/features/admin/components/support-ticket-list";

export const metadata: Metadata = { title: "Support Tickets" };

export default function SupportTicketsPage() {
  return <SupportTicketList />;
}
