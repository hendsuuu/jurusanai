import type { Metadata } from "next";
import { StorageBrowserView } from "@/features/admin/components/storage-browser-view";

export const metadata: Metadata = { title: "Storage Browser" };

export default function StoragePage() {
  return <StorageBrowserView />;
}
