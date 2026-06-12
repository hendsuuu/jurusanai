import { prisma } from "@/lib/prisma";
import type { AuditAction, Prisma } from "@prisma/client";

/**
 * Cached audit log enabled state. Refreshed every 60 seconds to avoid
 * hitting the DB on every single action while still respecting toggle changes.
 */
let cachedEnabled: boolean | null = null;
let cachedAt = 0;
const CACHE_TTL = 60_000; // 1 minute

async function isAuditLogEnabled(): Promise<boolean> {
  const now = Date.now();
  if (cachedEnabled !== null && now - cachedAt < CACHE_TTL) {
    return cachedEnabled;
  }

  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: "singleton" },
      select: { auditLogEnabled: true },
    });
    cachedEnabled = settings?.auditLogEnabled ?? true;
    cachedAt = now;
    return cachedEnabled;
  } catch {
    // If DB query fails, default to enabled (safe fallback)
    return true;
  }
}

/**
 * Invalidate the cached audit log setting. Call this when the setting
 * is toggled so the change takes effect immediately.
 */
export function invalidateAuditLogCache() {
  cachedEnabled = null;
  cachedAt = 0;
}

/**
 * Create an audit log entry if audit logging is enabled.
 * Drop-in replacement for `prisma.auditLog.create()` that respects
 * the admin toggle setting.
 *
 * Usage:
 * ```ts
 * await createAuditLog({
 *   action: "PAYMENT_SUCCESS",
 *   entityType: "Order",
 *   entityId: orderId,
 * });
 * ```
 */
export async function createAuditLog(
  data: {
    action: AuditAction;
    entityType?: string;
    entityId?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Prisma.InputJsonValue;
  }
): Promise<void> {
  const enabled = await isAuditLogEnabled();
  if (!enabled) return;

  await prisma.auditLog.create({ data });
}

/**
 * Clear all audit logs. Returns the count of deleted records.
 */
export async function clearAllAuditLogs(): Promise<number> {
  const result = await prisma.auditLog.deleteMany({});
  return result.count;
}
