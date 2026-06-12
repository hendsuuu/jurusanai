import type { NextRequest } from "next/server";
import { fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";

/**
 * GET /api/admin/backup
 *
 * Export the entire database as SQL INSERT statements.
 * Admin can download this as a .sql file for manual backup.
 * Useful for Neon free tier where automated backups are limited.
 */
export async function GET(_req: NextRequest) {
  try {
    await requireSuperadmin();

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const lines: string[] = [];

    lines.push(`-- JuruScope Database Backup`);
    lines.push(`-- Generated: ${new Date().toISOString()}`);
    lines.push(`-- WARNING: Contains sensitive data. Store securely.`);
    lines.push(``);
    lines.push(`BEGIN;`);
    lines.push(``);

    // Export AppSettings
    const settings = await prisma.appSettings.findMany();
    if (settings.length > 0) {
      lines.push(`-- AppSettings`);
      lines.push(`DELETE FROM "AppSettings";`);
      for (const row of settings) {
        lines.push(
          `INSERT INTO "AppSettings" ("id", "priceBasic", "pricePremium", "promoPercentage", "aiRecommendationProvider", "aiRecommendationModel", "aiPlanProvider", "aiPlanModel", "auditLogEnabled", "updatedAt") VALUES (${esc(row.id)}, ${row.priceBasic}, ${row.pricePremium}, ${row.promoPercentage}, ${esc(row.aiRecommendationProvider)}, ${esc(row.aiRecommendationModel)}, ${esc(row.aiPlanProvider)}, ${esc(row.aiPlanModel)}, ${row.auditLogEnabled}, ${esc(row.updatedAt.toISOString())});`
        );
      }
      lines.push(``);
    }

    // Export Users
    const users = await prisma.user.findMany();
    if (users.length > 0) {
      lines.push(`-- Users`);
      lines.push(`DELETE FROM "User";`);
      for (const row of users) {
        lines.push(
          `INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "createdAt", "updatedAt") VALUES (${esc(row.id)}, ${esc(row.name)}, ${esc(row.email)}, ${esc(row.passwordHash)}, '${row.role}', ${esc(row.createdAt.toISOString())}, ${esc(row.updatedAt.toISOString())});`
        );
      }
      lines.push(``);
    }

    // Export DiscoveryResults
    const plans = await prisma.discoveryResult.findMany();
    if (plans.length > 0) {
      lines.push(`-- DiscoveryResults`);
      lines.push(`DELETE FROM "DiscoveryResult";`);
      for (const row of plans) {
        lines.push(
          `INSERT INTO "DiscoveryResult" ("id", "userId", "studentName", "studentEmail", "age", "grade", "school", "personalityId", "personalityTitle", "interestArea", "dailyEnergy", "futureLifestyle", "workStyle", "naturalBehavior", "motivation", "socialStyle", "decisionStyle", "status", "pdfUrl", "reportJson", "personalityJson", "metaJson", "createdAt", "updatedAt") VALUES (${esc(row.id)}, ${esc(row.userId)}, ${esc(row.studentName)}, ${esc(row.studentEmail)}, ${esc(row.age)}, ${esc(row.grade)}, ${esc(row.school)}, ${esc(row.personalityId)}, ${esc(row.personalityTitle)}, ${esc(row.interestArea)}, ${esc(row.dailyEnergy)}, ${esc(row.futureLifestyle)}, ${esc(row.workStyle)}, ${esc(row.naturalBehavior)}, ${esc(row.motivation)}, ${esc(row.socialStyle)}, ${esc(row.decisionStyle)}, '${row.status}', ${esc(row.pdfUrl)}, ${escJson(row.reportJson)}, ${escJson(row.personalityJson)}, ${escJson(row.metaJson)}, ${esc(row.createdAt.toISOString())}, ${esc(row.updatedAt.toISOString())});`
        );
      }
      lines.push(``);
    }

    // Export Orders
    const orders = await prisma.order.findMany();
    if (orders.length > 0) {
      lines.push(`-- Orders`);
      lines.push(`DELETE FROM "Order";`);
      for (const row of orders) {
        lines.push(
          `INSERT INTO "Order" ("id", "orderCode", "discoveryResultId", "userId", "packageType", "amount", "currency", "status", "paymentProvider", "paymentToken", "paymentUrl", "providerReference", "customerName", "customerEmail", "customerPhone", "emailStatus", "emailSentAt", "emailMessageId", "emailError", "emailAttempts", "rawPaymentRequest", "rawPaymentResponse", "rawWebhookPayload", "paidAt", "expiredAt", "createdAt", "updatedAt") VALUES (${esc(row.id)}, ${esc(row.orderCode)}, ${esc(row.discoveryResultId)}, ${esc(row.userId)}, '${row.packageType}', ${row.amount}, ${esc(row.currency)}, '${row.status}', ${esc(row.paymentProvider)}, ${esc(row.paymentToken)}, ${esc(row.paymentUrl)}, ${esc(row.providerReference)}, ${esc(row.customerName)}, ${esc(row.customerEmail)}, ${esc(row.customerPhone)}, ${esc(row.emailStatus)}, ${esc(row.emailSentAt?.toISOString() ?? null)}, ${esc(row.emailMessageId)}, ${esc(row.emailError)}, ${row.emailAttempts}, ${escJson(row.rawPaymentRequest)}, ${escJson(row.rawPaymentResponse)}, ${escJson(row.rawWebhookPayload)}, ${esc(row.paidAt?.toISOString() ?? null)}, ${esc(row.expiredAt?.toISOString() ?? null)}, ${esc(row.createdAt.toISOString())}, ${esc(row.updatedAt.toISOString())});`
        );
      }
      lines.push(``);
    }

    // Export SupportTickets
    const tickets = await prisma.supportTicket.findMany();
    if (tickets.length > 0) {
      lines.push(`-- SupportTickets`);
      lines.push(`DELETE FROM "SupportTicket";`);
      for (const row of tickets) {
        lines.push(
          `INSERT INTO "SupportTicket" ("id", "ticketNumber", "fromEmail", "fromName", "toEmail", "subject", "messageText", "messageHtml", "status", "priority", "source", "userId", "orderId", "assignedAdminId", "resendEmailId", "firstResponseAt", "resolvedAt", "createdAt", "updatedAt") VALUES (${esc(row.id)}, ${esc(row.ticketNumber)}, ${esc(row.fromEmail)}, ${esc(row.fromName)}, ${esc(row.toEmail)}, ${esc(row.subject)}, ${esc(row.messageText)}, ${esc(row.messageHtml)}, '${row.status}', '${row.priority}', '${row.source}', ${esc(row.userId)}, ${esc(row.orderId)}, ${esc(row.assignedAdminId)}, ${esc(row.resendEmailId)}, ${esc(row.firstResponseAt?.toISOString() ?? null)}, ${esc(row.resolvedAt?.toISOString() ?? null)}, ${esc(row.createdAt.toISOString())}, ${esc(row.updatedAt.toISOString())});`
        );
      }
      lines.push(``);
    }

    // Export SupportTicketReplies
    const replies = await prisma.supportTicketReply.findMany();
    if (replies.length > 0) {
      lines.push(`-- SupportTicketReplies`);
      lines.push(`DELETE FROM "SupportTicketReply";`);
      for (const row of replies) {
        lines.push(
          `INSERT INTO "SupportTicketReply" ("id", "supportTicketId", "senderType", "senderEmail", "senderName", "messageText", "messageHtml", "createdAt") VALUES (${esc(row.id)}, ${esc(row.supportTicketId)}, '${row.senderType}', ${esc(row.senderEmail)}, ${esc(row.senderName)}, ${esc(row.messageText)}, ${esc(row.messageHtml)}, ${esc(row.createdAt.toISOString())});`
        );
      }
      lines.push(``);
    }

    // Export AuditLogs (optional — can be large)
    const auditCount = await prisma.auditLog.count();
    if (auditCount > 0 && auditCount <= 5000) {
      const audits = await prisma.auditLog.findMany({ orderBy: { createdAt: "asc" } });
      lines.push(`-- AuditLogs (${auditCount} entries)`);
      lines.push(`DELETE FROM "AuditLog";`);
      for (const row of audits) {
        lines.push(
          `INSERT INTO "AuditLog" ("id", "userId", "action", "entityType", "entityId", "ipAddress", "userAgent", "metadata", "createdAt") VALUES (${esc(row.id)}, ${esc(row.userId)}, '${row.action}', ${esc(row.entityType)}, ${esc(row.entityId)}, ${esc(row.ipAddress)}, ${esc(row.userAgent)}, ${escJson(row.metadata)}, ${esc(row.createdAt.toISOString())});`
        );
      }
      lines.push(``);
    } else if (auditCount > 5000) {
      lines.push(`-- AuditLogs skipped (${auditCount} entries — too large for inline backup)`);
      lines.push(``);
    }

    lines.push(`COMMIT;`);
    lines.push(``);
    lines.push(`-- End of backup`);

    const sql = lines.join("\n");
    const fileName = `juruscope-backup-${timestamp}.sql`;

    logger.info(`[admin] Database backup generated: ${sql.length} bytes, ${lines.length} lines`);

    return new Response(sql, {
      status: 200,
      headers: {
        "Content-Type": "application/sql",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(Buffer.byteLength(sql, "utf-8")),
      },
    });
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.backup failed", error);
    return fail("Gagal membuat backup database", 500);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function esc(value: string | null | undefined): string {
  if (value === null || value === undefined) return "NULL";
  // Escape single quotes for SQL
  const escaped = value.replace(/'/g, "''").replace(/\\/g, "\\\\");
  return `'${escaped}'`;
}

function escJson(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  const json = JSON.stringify(value).replace(/'/g, "''");
  return `'${json}'::jsonb`;
}
