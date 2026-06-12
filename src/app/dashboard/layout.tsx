import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/features/admin/components/admin-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPERADMIN") {
    redirect("/login");
  }

  return (
    <AdminShell user={{ name: session.user.name ?? null, email: session.user.email ?? "" }}>
      {children}
    </AdminShell>
  );
}
