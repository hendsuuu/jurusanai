import type { Metadata } from "next";
import { AdminSettingsView } from "@/features/admin/components/admin-settings-view";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return <AdminSettingsView />;
}
