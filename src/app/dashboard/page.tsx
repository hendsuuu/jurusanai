import type { Metadata } from "next";
import { OverviewView } from "@/features/admin/components/overview-view";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardOverviewPage() {
  return <OverviewView />;
}
