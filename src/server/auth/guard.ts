import { auth } from "@/auth";
import { AppError } from "@/server/utils/error";

export async function requireSuperadmin() {
  const session = await auth();
  if (!session?.user) {
    throw new AppError("UNAUTHORIZED", "Unauthorized", 401);
  }
  if (session.user.role !== "SUPERADMIN") {
    throw new AppError("FORBIDDEN", "Forbidden", 403);
  }
  return session;
}

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}
