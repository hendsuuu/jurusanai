import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import {
  getTicketDetail,
  updateTicketStatus,
  updateTicketPriority,
  replyToTicket,
} from "@/server/support/support.service";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";
import type { SupportTicketPriority, SupportTicketStatus } from "@prisma/client";

/**
 * GET /api/admin/support-tickets/[ticketId]
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    await requireSuperadmin();
    const { ticketId } = await params;
    const ticket = await getTicketDetail(ticketId);
    if (!ticket) return fail("Ticket tidak ditemukan", 404);
    return ok(ticket);
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.support-tickets.detail failed", error);
    return fail("Gagal mengambil detail ticket", 500);
  }
}

/**
 * PATCH /api/admin/support-tickets/[ticketId]
 *
 * Update status and/or priority.
 * Body: { status?: string, priority?: string, reply?: string }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await requireSuperadmin();
    const { ticketId } = await params;
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return fail("Body tidak valid", 400);
    }

    const { status, priority, reply } = body as {
      status?: SupportTicketStatus;
      priority?: SupportTicketPriority;
      reply?: string;
    };

    if (status) {
      await updateTicketStatus(ticketId, status);
    }
    if (priority) {
      await updateTicketPriority(ticketId, priority);
    }
    if (reply && typeof reply === "string" && reply.trim()) {
      await replyToTicket({
        ticketId,
        adminEmail: session.user.email ?? "admin@juruscope.id",
        adminName: session.user.name ?? null,
        message: reply.trim(),
      });
    }

    const updated = await getTicketDetail(ticketId);
    return ok(updated, "Ticket berhasil diupdate");
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.support-tickets.update failed", error);
    return fail("Gagal mengupdate ticket", 500);
  }
}
