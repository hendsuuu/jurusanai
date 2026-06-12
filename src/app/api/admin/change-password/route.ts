import type { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { ok, fail } from "@/server/utils/api-response";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/server/auth/guard";
import { hashPassword } from "@/server/auth/password";
import { rateLimitOrThrow, authLimiter } from "@/server/rate-limit/limiter";
import { getClientIp } from "@/server/rate-limit/keys";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter")
      .max(128, "Password baru maksimal 128 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Password baru harus berbeda dengan password lama",
    path: ["newPassword"],
  });

/**
 * POST /api/admin/change-password
 *
 * Change the password of the currently logged-in superadmin.
 * Requires the current password for verification.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireSuperadmin();

    // Rate limit by IP to prevent brute force
    const ip = getClientIp(req);
    await rateLimitOrThrow(authLimiter, `change-password:${ip}`);

    const body = await req.json().catch(() => null);
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Input tidak valid";
      return fail(firstError, 422, parsed.error.flatten());
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true, email: true },
    });

    if (!user || !user.passwordHash) {
      return fail("User tidak ditemukan", 404);
    }

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return fail("Password lama salah", 401);
    }

    const newHash = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    logger.info(`[admin] Password changed for ${user.email}`);

    return ok({ success: true }, "Password berhasil diubah");
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.change-password failed", error);
    return fail("Gagal mengubah password", 500);
  }
}
