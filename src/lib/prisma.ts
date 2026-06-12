import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Ensures the DATABASE_URL uses `sslmode=verify-full` explicitly to avoid
 * the pg v9 deprecation warning about weaker SSL mode aliases.
 */
function getSecureConnectionString(): string {
  const raw = process.env.DATABASE_URL!;

  // Local dev without SSL — don't modify
  if (raw.includes("localhost") || raw.includes("127.0.0.1")) {
    return raw;
  }

  const url = new URL(raw);

  // Replace any existing sslmode with verify-full
  url.searchParams.set("sslmode", "verify-full");

  return url.toString();
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: getSecureConnectionString(),
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
