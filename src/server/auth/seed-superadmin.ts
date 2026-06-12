import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { hashPassword } from "./password";

export async function seedSuperadmin() {
  const email = env.SUPERADMIN_EMAIL;
  const password = env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    // eslint-disable-next-line no-console
    console.warn(
      "Skipping superadmin seed: SUPERADMIN_EMAIL/SUPERADMIN_PASSWORD not set"
    );
    return null;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "SUPERADMIN") {
      await prisma.user.update({
        where: { email },
        data: { role: "SUPERADMIN" },
      });
    }
    return existing;
  }

  const passwordHash = await hashPassword(password);
  return prisma.user.create({
    data: {
      email,
      name: "Superadmin",
      passwordHash,
      role: "SUPERADMIN",
    },
  });
}
