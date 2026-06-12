import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=invalid");
    }
    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user?.role === "SUPERADMIN") redirect("/dashboard");
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-[#F6F4E9] px-4 py-10">
      <Container variant="narrow" className="max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <BrandLogo size="md" />
          </Link>
        </div>
        <Card className="p-7 sm:p-8">
          <h1 className="text-xl font-bold text-[#2A311A]">Login Superadmin</h1>
          <p className="text-sm text-[#57604A] mt-1">
            Akses dashboard manajemen order dan self discovery report.
          </p>
          {error ? (
            <p
              role="alert"
              className="mt-4 text-sm text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-3 py-2 rounded-[12px]"
            >
              Email atau password tidak cocok.
            </p>
          ) : null}
          <form action={loginAction} className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@juruscope.id"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" size="lg" className="w-full">
              Masuk
            </Button>
          </form>
        </Card>
        <p className="text-center text-xs text-[#8A8A72] mt-4">
          <Link href="/" className="hover:text-[#4B5320]">
            ← Kembali ke beranda
          </Link>
        </p>
      </Container>
    </div>
  );
}
