import "dotenv/config";
import { seedSuperadmin } from "@/server/auth/seed-superadmin";
import { prisma } from "@/lib/prisma";

async function main() {
  const user = await seedSuperadmin();
  if (user) {
    // eslint-disable-next-line no-console
    console.log(`✓ Superadmin ready: ${user.email}`);
  }
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
